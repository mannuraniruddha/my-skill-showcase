# RAG Document QA System

A production-ready Retrieval-Augmented Generation (RAG) system demonstrating real-world GenAI architecture decisions and multi-provider LLM resilience.

## What I Built

As a Technical Program Manager, I wanted to demonstrate hands-on understanding of GenAI systems — not just buzzwords. This project showcases **architectural thinking** and **production resilience patterns**.

### Core Architecture

```
Document Upload → Text Extraction → Chunking → Embeddings → Vector Store
                                                                    ↓
User Query → Embedding → Semantic Search → Top-k Retrieval → LLM Generation → Response
```

### Key Components

| Component | What I Built | Why It Matters |
|-----------|--------------|----------------|
| **Document Processor** | Multi-format extraction (PDF, TXT, MD), smart chunking with overlap | Preserves context across chunk boundaries |
| **Vector Store** | Pluggable embedding providers (OpenAI, sentence-transformers, fallback) | Graceful degradation when APIs unavailable |
| **LLM Client** | Multi-provider support (OpenAI, Gemini, Anthropic, Ollama) | Resilient to provider outages and rate limits |
| **API Layer** | FastAPI with streaming, observability, error handling | Production-ready interface |
| **Web UI** | Drag-drop upload, chat interface, source citations | Demonstrates end-to-end ownership |

### Production Thinking Demonstrated

1. **Graceful Degradation Chain**
   - Primary: OpenAI embeddings + generation
   - Fallback 1: Local sentence-transformers embeddings
   - Fallback 2: Multiple LLM providers (OpenAI → Gemini → Anthropic → Ollama)
   - Ultimate fallback: Template-based keyword extraction

2. **Observability**
   - Latency tracking per request
   - Similarity scores for retrieved chunks
   - Source citations for answer verification
   - Session persistence for conversation context

3. **Trade-off Documentation**
   - *Chunk size*: 500 chars balances context vs precision
   - *Overlap (50 chars)*: Prevents semantic loss at boundaries, adds 10% storage
   - *top_k (5)*: Sweet spot for recall vs noise
   - *Temperature (0.7)*: Balanced creativity/consistency

## Tech Stack

- **Backend**: FastAPI, Python 3.11+
- **Embeddings**: OpenAI text-embedding-3-small / sentence-transformers (all-MiniLM-L6-v2)
- **Vector Search**: In-memory with cosine similarity (ChromaDB for production)
- **LLM Providers**: OpenAI, Google Gemini, Anthropic Claude, Ollama (local)
- **Frontend**: Vanilla HTML/JS (no framework dependencies)

## Quick Start

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Set your preferred LLM provider (optional — system works without)
export OPENAI_API_KEY="your-key"        # Option 1: Best quality
export GEMINI_API_KEY="your-key"        # Option 2: Google
export ANTHROPIC_API_KEY="your-key"     # Option 3: Claude

# Start backend
cd backend
python -m uvicorn main:app --reload

# Open frontend
open frontend/index.html  # Or: python -m http.server 3000
```

## TPM Interview Talking Points

**Why I chose this architecture:**

1. **Modularity**: Each component (processing, embeddings, retrieval, generation) is swappable. In a TPM role, I'd evaluate vendor solutions vs build decisions at each layer.

2. **Resilience**: Multi-provider fallbacks aren't just nice-to-have — they're operational requirements. When OpenAI had an outage last year, systems with single-provider dependencies went down.

3. **Observability**: I instrumented latency, similarity scores, and source tracking. In production, I'd add: retrieval accuracy metrics, answer relevance scoring (human eval), cost per query tracking.

**What I'd change for production:**

- **Persistence**: Replace in-memory store with ChromaDB/Pinecone
- **Async Processing**: Document ingestion should be async (Celery/RabbitMQ)
- **Caching**: Semantic cache for repeated queries, Redis for session state
- **Evaluation**: RAGAS framework for automated quality metrics
- **Security**: Input sanitization, rate limiting, PII detection

**RAG vs Fine-tuning trade-off:**

| Factor | RAG | Fine-tuning |
|--------|-----|-------------|
| Knowledge updates | Instant (upload doc) | Requires retraining |
| Cost | Pay per query | Upfront + per query |
| Hallucination | Lower (grounded in docs) | Higher (model can drift) |
| Latency | Higher (retrieval + generation) | Lower (single generation) |

For document Q&A, RAG wins. For style/tone tasks, fine-tuning.

## Sample Usage

Upload `sample_resume.md` and query:
- "What certifications does this person have?"
- "Summarize their experience at TechCorp"
- "What makes them a good TPM candidate?"

The system returns:
1. **Generated answer** (from LLM)
2. **Source citations** (which chunks were used)
3. **Similarity scores** (confidence indicator)
4. **Latency** (performance metric)

## Project Structure

```
rag-document-qa/
├── backend/
│   ├── main.py              # FastAPI orchestration
│   ├── document_processor.py # Chunking strategies, text extraction
│   ├── vector_store.py      # Embeddings, similarity search
│   ├── llm_client.py        # Multi-provider generation
│   └── requirements.txt
├── frontend/
│   └── index.html           # Interactive chat UI
├── sample_resume.md         # Demo document
└── README.md                # This file
```

## What I Learned

- **Embedding models**: `all-MiniLM-L6-v2` (local) is surprisingly good for demo purposes. For production, I'd benchmark against OpenAI's `text-embedding-3-small`.
- **Chunking is critical**: 500 chars with 50 overlap worked best for resumes. Too small loses context; too large dilutes retrieval precision.
- **Multi-provider resilience is hard**: Each provider has different SDKs, error patterns, and rate limits. A unified interface (like I built) is worth the effort.
- **Latency matters**: ~700ms end-to-end with sentence-transformers + local fallback. Acceptable for demo; production needs caching.

## Next Steps

- [ ] Hybrid search: Combine semantic + keyword (BM25) for better recall
- [ ] Re-ranking: Cross-encoder model to improve top-k quality
- [ ] Evaluation: RAGAS metrics for automated testing
- [ ] Multi-modal: Support images, tables in documents

---

**Built by:** Aniruddha Mannur (Technical Program Manager)

**Purpose:** Demonstrate GenAI system design thinking for TPM roles

**Status:** Functional RAG retrieval system with LLM integration (tested with sentence-transformers + OpenAI/Gemini/Anthropic)
