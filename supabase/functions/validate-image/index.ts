import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Magic number signatures for allowed image types
const IMAGE_SIGNATURES: { [key: string]: { signature: number[], offset: number } } = {
  'image/jpeg': { signature: [0xFF, 0xD8, 0xFF], offset: 0 },
  'image/png': { signature: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], offset: 0 },
  'image/gif': { signature: [0x47, 0x49, 0x46, 0x38], offset: 0 }, // GIF87a or GIF89a
  'image/webp': { signature: [0x57, 0x45, 0x42, 0x50], offset: 8 }, // WEBP at offset 8 (after RIFF header)
};

// Additional check for RIFF header in WebP
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46]; // "RIFF"

function checkMagicNumber(bytes: Uint8Array, mimeType: string): boolean {
  const sigInfo = IMAGE_SIGNATURES[mimeType];
  if (!sigInfo) return false;

  // Special handling for WebP (needs RIFF header check)
  if (mimeType === 'image/webp') {
    // Check RIFF header first
    for (let i = 0; i < RIFF_SIGNATURE.length; i++) {
      if (bytes[i] !== RIFF_SIGNATURE[i]) return false;
    }
  }

  // Check main signature at specified offset
  for (let i = 0; i < sigInfo.signature.length; i++) {
    if (bytes[sigInfo.offset + i] !== sigInfo.signature[i]) return false;
  }

  return true;
}

function detectActualMimeType(bytes: Uint8Array): string | null {
  for (const [mimeType, sigInfo] of Object.entries(IMAGE_SIGNATURES)) {
    if (checkMagicNumber(bytes, mimeType)) {
      return mimeType;
    }
  }
  return null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const declaredType = formData.get('declaredType') as string | null;

    if (!file) {
      return new Response(
        JSON.stringify({ valid: false, error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Read the first 16 bytes for magic number detection
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (buffer.byteLength > maxSize) {
      return new Response(
        JSON.stringify({ valid: false, error: 'File exceeds 5MB limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect actual MIME type from file content
    const actualMimeType = detectActualMimeType(bytes);

    if (!actualMimeType) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'File content does not match any allowed image format (JPEG, PNG, GIF, WebP)' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify declared type matches actual content
    if (declaredType && declaredType !== actualMimeType) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: `File content mismatch: declared as ${declaredType} but detected as ${actualMimeType}`,
          detectedType: actualMimeType
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for suspicious patterns that might indicate embedded scripts
    // Convert first 1KB to string for quick text pattern check
    const headerBytes = bytes.slice(0, 1024);
    const headerText = new TextDecoder('utf-8', { fatal: false }).decode(headerBytes);
    
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /data:text\/html/i,
      /onclick=/i,
      /onerror=/i,
      /onload=/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(headerText)) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'File contains suspicious content patterns' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        valid: true, 
        detectedType: actualMimeType,
        size: buffer.byteLength 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal validation error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
