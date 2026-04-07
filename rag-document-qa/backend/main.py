from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
import asyncio
from datetime import datetime

from document_processor import DocumentProcessor
from vector_store import VectorStore
from llm_client import LLMClient

app = FastAPI(title="RAG Doc Analyzer", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
doc_processor = DocumentProcessor()
vector_store = VectorStore()
llm_client = LLMClient()

# In-memory storage for uploaded documents (in production, use a database)
uploaded_docs = {}

class QueryRequest(BaseModel):
    question: str
    session_id: Optional[str] = None
    stream: bool = False
    top_k: int = 5

class QueryResponse(BaseModel):
    answer: str
    sources: List[dict]
    session_id: str
    latency_ms: float

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a document for RAG."""
    try:
        # Validate file type
        allowed_types = ["application/pdf", "text/plain", "text/markdown"]
        ext = os.path.splitext(file.filename)[1].lower()
        
        if file.content_type not in allowed_types and ext not in ['.pdf', '.txt', '.md']:
            raise HTTPException(status_code=400, detail="Only PDF, TXT, and MD files are allowed")
        
        # Generate document ID
        doc_id = str(uuid.uuid4())
        
        # Read file content
        content = await file.read()
        
        # Process document (extract text and chunk)
        chunks = doc_processor.process_document(content, file.filename, ext)
        
        # Store in vector database
        vector_store.add_documents(doc_id, chunks)
        
        # Track upload
        uploaded_docs[doc_id] = {
            "filename": file.filename,
            "uploaded_at": datetime.now().isoformat(),
            "chunk_count": len(chunks)
        }
        
        return {
            "doc_id": doc_id,
            "filename": file.filename,
            "chunks_created": len(chunks),
            "message": "Document processed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """Query the RAG system."""
    start_time = datetime.now()
    
    try:
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        # Retrieve relevant chunks
        relevant_chunks = vector_store.search(request.question, top_k=request.top_k)
        
        if not relevant_chunks:
            latency_ms = (datetime.now() - start_time).total_seconds() * 1000
            return QueryResponse(
                answer="I couldn't find any relevant information in the uploaded documents. Please try uploading some documents first or ask a different question.",
                sources=[],
                session_id=session_id,
                latency_ms=latency_ms
            )
        
        # Generate answer using LLM
        if request.stream:
            return StreamingResponse(
                llm_client.generate_streaming(request.question, relevant_chunks, session_id),
                media_type="text/event-stream"
            )
        else:
            answer = llm_client.generate(request.question, relevant_chunks, session_id)
            
        latency_ms = (datetime.now() - start_time).total_seconds() * 1000
        
        return QueryResponse(
            answer=answer,
            sources=relevant_chunks,
            session_id=session_id,
            latency_ms=latency_ms
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
async def list_documents():
    """List all uploaded documents."""
    return {"documents": list(uploaded_docs.values())}

@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Delete a document and its chunks."""
    if doc_id not in uploaded_docs:
        raise HTTPException(status_code=404, detail="Document not found")
    
    vector_store.delete_document(doc_id)
    del uploaded_docs[doc_id]
    
    return {"message": "Document deleted successfully"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "documents_loaded": len(uploaded_docs)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)