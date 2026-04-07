import re
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class TextChunk:
    """Represents a chunk of text with metadata."""
    text: str
    doc_id: str
    chunk_index: int
    source_file: str
    start_char: int
    end_char: int

class DocumentProcessor:
    """
    Processes documents for RAG.
    
    Key TPM considerations demonstrated:
    - Chunking strategy affects retrieval quality
    - Overlap prevents context loss at boundaries
    - Different file types need different extraction
    """
    
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def process_document(self, content: bytes, filename: str, ext: str) -> List[TextChunk]:
        """Process a document and return chunks."""
        # Extract text based on file type
        if ext == '.pdf':
            text = self._extract_pdf(content)
        else:
            text = content.decode('utf-8', errors='ignore')
        
        # Clean text
        text = self._clean_text(text)
        
        # Generate doc ID from filename
        import uuid
        doc_id = str(uuid.uuid4())
        
        # Chunk the text
        chunks = self._chunk_text(text, doc_id, filename)
        
        return chunks
    
    def _extract_pdf(self, content: bytes) -> str:
        """Extract text from PDF. Requires PyPDF2."""
        try:
            from PyPDF2 import PdfReader
            import io
            
            reader = PdfReader(io.BytesIO(content))
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except ImportError:
            raise ImportError("PyPDF2 is required for PDF processing. Install with: pip install PyPDF2")
    
    def _clean_text(self, text: str) -> str:
        """Clean extracted text."""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)\[\]\"\']', ' ', text)
        return text.strip()
    
    def _chunk_text(self, text: str, doc_id: str, source_file: str) -> List[TextChunk]:
        """
        Split text into overlapping chunks.
        
        Why overlap? Prevents losing context at chunk boundaries.
        For example, if a sentence spans two chunks, the overlap 
        ensures the LLM sees both parts.
        """
        chunks = []
        start = 0
        chunk_index = 0
        
        while start < len(text):
            end = min(start + self.chunk_size, len(text))
            
            # Try to end at a sentence boundary
            if end < len(text):
                # Look for sentence endings within last 50 chars
                search_start = max(start + self.chunk_size - 50, start)
                sentence_end = text.rfind('. ', search_start, end)
                if sentence_end != -1:
                    end = sentence_end + 1  # Include the period
            
            chunk_text = text[start:end].strip()
            
            if chunk_text:  # Only add non-empty chunks
                chunks.append(TextChunk(
                    text=chunk_text,
                    doc_id=doc_id,
                    chunk_index=chunk_index,
                    source_file=source_file,
                    start_char=start,
                    end_char=end
                ))
                chunk_index += 1
            
            # Move start forward by chunk_size - overlap
            start += self.chunk_size - self.chunk_overlap
        
        return chunks