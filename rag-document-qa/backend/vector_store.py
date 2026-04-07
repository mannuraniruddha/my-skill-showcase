import os
import numpy as np
from typing import List, Dict, Any
import hashlib

# In-memory storage (use ChromaDB or similar in production)
class VectorStore:
    """
    Simple in-memory vector store for demonstration.
    
    In production, you'd use:
    - ChromaDB (easiest local option)
    - Pinecone (managed, scalable)
    - Weaviate (self-hosted, feature-rich)
    - pgvector (if already using PostgreSQL)
    """
    
    def __init__(self):
        self.documents: Dict[str, List[Dict]] = {}  # doc_id -> chunks
        self.embeddings: List[tuple] = []  # (embedding, chunk_data)
        self.embedding_dim = None
        
    def _get_embedding(self, text: str) -> List[float]:
        """
        Get embedding for text.
        
        Strategy: Try OpenAI first, fall back to sentence-transformers,
        then to simple bag-of-words for demo purposes.
        """
        # Try OpenAI
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            try:
                import openai
                client = openai.OpenAI(api_key=openai_key)
                response = client.embeddings.create(
                    model="text-embedding-3-small",
                    input=text
                )
                return response.data[0].embedding
            except Exception as e:
                print(f"OpenAI embedding failed: {e}, falling back...")
        
        # Try sentence-transformers (local, free)
        try:
            from sentence_transformers import SentenceTransformer
            if not hasattr(self, '_model'):
                print("Loading sentence-transformers model...")
                self._model = SentenceTransformer('all-MiniLM-L6-v2')
            embedding = self._model.encode(text)
            return embedding.tolist()
        except ImportError:
            pass
        except Exception as e:
            print(f"Sentence-transformers failed: {e}, using simple fallback...")
        
        # Ultimate fallback: simple hash-based embedding (NOT for production)
        # This is just so the demo works without any API keys
        return self._simple_embedding(text)
    
    def _simple_embedding(self, text: str) -> List[float]:
        """
        Simple character-level embedding for demo purposes.
        NOT suitable for production but works without dependencies.
        """
        # Create a simple 384-dimensional embedding based on character frequencies
        embedding = [0.0] * 384
        text_lower = text.lower()
        
        for i, char in enumerate(text_lower):
            char_code = ord(char) % 384
            embedding[char_code] += 1.0 / (i + 1)  # Weight by position
        
        # Normalize
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = [x / norm for x in embedding]
        
        return embedding
    
    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        a_norm = np.linalg.norm(a)
        b_norm = np.linalg.norm(b)
        if a_norm == 0 or b_norm == 0:
            return 0.0
        return np.dot(a, b) / (a_norm * b_norm)
    
    def add_documents(self, doc_id: str, chunks: List):
        """Add document chunks to the store."""
        self.documents[doc_id] = []
        
        for chunk in chunks:
            # Generate embedding
            embedding = self._get_embedding(chunk.text)
            self.embedding_dim = len(embedding)
            
            chunk_data = {
                "text": chunk.text,
                "doc_id": chunk.doc_id,
                "chunk_index": chunk.chunk_index,
                "source_file": chunk.source_file,
                "start_char": chunk.start_char,
                "end_char": chunk.end_char
            }
            
            self.documents[doc_id].append(chunk_data)
            self.embeddings.append((embedding, chunk_data))
    
    def search(self, query: str, top_k: int = 5) -> List[Dict]:
        """
        Search for relevant chunks using cosine similarity.
        
        TPM consideration: top_k is a tunable parameter.
        - Too low: miss relevant context
        - Too high: include noise, increase LLM cost
        - Sweet spot: usually 3-7 depending on chunk size
        """
        if not self.embeddings:
            return []
        
        # Get query embedding
        query_embedding = self._get_embedding(query)
        
        # Calculate similarities
        similarities = []
        for emb, chunk_data in self.embeddings:
            sim = self._cosine_similarity(query_embedding, emb)
            similarities.append((sim, chunk_data))
        
        # Sort by similarity (descending) and take top_k
        similarities.sort(key=lambda x: x[0], reverse=True)
        top_results = similarities[:top_k]
        
        # Return with similarity scores
        return [
            {
                **chunk_data,
                "similarity_score": round(float(sim), 4)
            }
            for sim, chunk_data in top_results
        ]
    
    def delete_document(self, doc_id: str):
        """Remove all chunks belonging to a document."""
        if doc_id in self.documents:
            # Remove from embeddings list
            self.embeddings = [
                (emb, chunk) for emb, chunk in self.embeddings
                if chunk["doc_id"] != doc_id
            ]
            # Remove from documents dict
            del self.documents[doc_id]