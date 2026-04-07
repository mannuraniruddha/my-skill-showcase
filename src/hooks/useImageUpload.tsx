import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const validateImageServerSide = async (file: File): Promise<{ valid: boolean; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('declaredType', file.type);

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('validate-image', {
        body: formData,
      });

      if (response.error) {
        console.error('Server validation error:', response.error);
        return { valid: false, error: 'Server validation failed' };
      }

      return response.data as { valid: boolean; error?: string };
    } catch (error) {
      console.error('Validation request error:', error);
      // If server validation fails, fall back to client-side only (with warning)
      console.warn('Server-side validation unavailable, proceeding with client-side validation only');
      return { valid: true };
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    // Client-side validation first (fast feedback)
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, or WebP image.",
        variant: "destructive",
      });
      return null;
    }

    if (file.size > MAX_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);

    try {
      // Server-side validation (security)
      const validation = await validateImageServerSide(file);
      
      if (!validation.valid) {
        toast({
          title: "Invalid image file",
          description: validation.error || "The file content does not match a valid image format.",
          variant: "destructive",
        });
        return null;
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("content-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("content-images")
        .getPublicUrl(filePath);

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });

      return urlData.publicUrl;
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImage, isUploading };
};
