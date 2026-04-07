import os
from typing import List, Dict, Any, Generator
import json

class LLMClient:
    """
    LLM client with multiple provider support.
    
    Priority: OpenAI > Gemini > Anthropic > Ollama > Fallback
    
    Demonstrates TPM thinking on:
    - Model selection trade-offs (cost vs capability)
    - Streaming vs batch responses
    - Fallback strategies for reliability
    - Multi-provider resilience
    """
    
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        self.preferred_model = "gpt-3.5-turbo"  # Cost-effective for demos
        self.capable_model = "gpt-4"  # For complex reasoning
    
    def _build_prompt(self, question: str, context_chunks: List[Dict], session_id: str) -> str:
        """
        Build the RAG prompt.
        
        Key elements:
        1. System instructions (how to behave)
        2. Context (retrieved chunks)
        3. Question
        4. Constraints (citations, honesty)
        """
        # Combine context chunks
        context_text = "\n\n---\n\n".join([
            f"[Source: {chunk['source_file']}, Chunk {chunk['chunk_index']}]\n{chunk['text']}"
            for chunk in context_chunks
        ])
        
        prompt = f"""You are a helpful assistant answering questions based on the provided documents.

## Retrieved Context:
{context_text}

## Question:
{question}

## Instructions:
1. Answer based ONLY on the provided context above
2. If the answer isn't in the context, say "I don't have enough information to answer that"
3. Cite your sources when possible (refer to the Source and Chunk number)
4. Be concise but complete

## Answer:"""
        
        return prompt
    
    def generate(self, question: str, context_chunks: List[Dict], session_id: str) -> str:
        """Generate a non-streaming response."""
        prompt = self._build_prompt(question, context_chunks, session_id)
        
        # Try OpenAI first
        if self.openai_key:
            try:
                import openai
                client = openai.OpenAI(api_key=self.openai_key)
                
                response = client.chat.completions.create(
                    model=self.preferred_model,
                    messages=[
                        {"role": "system", "content": "You are a helpful document assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=500
                )
                
                return response.choices[0].message.content
                
            except Exception as e:
                print(f"OpenAI generation failed: {e}")
        
        # Try Gemini (Google)
        if self.gemini_key:
            try:
                return self._gemini_generate(prompt)
            except Exception as e:
                print(f"Gemini generation failed: {e}")
        
        # Try Anthropic (Claude)
        if self.anthropic_key:
            try:
                return self._anthropic_generate(prompt)
            except Exception as e:
                print(f"Anthropic generation failed: {e}")
        
        # Fallback: Ollama (local)
        try:
            return self._ollama_generate(prompt)
        except Exception as e:
            print(f"Ollama failed: {e}")
        
        # Ultimate fallback: template response
        print("All LLM providers failed, using fallback response...")
        return self._fallback_response(question, context_chunks)
    
    def generate_streaming(self, question: str, context_chunks: List[Dict], session_id: str) -> Generator[str, None, None]:
        """Generate a streaming response."""
        prompt = self._build_prompt(question, context_chunks, session_id)
        
        if self.openai_key:
            try:
                import openai
                client = openai.OpenAI(api_key=self.openai_key)
                
                response = client.chat.completions.create(
                    model=self.preferred_model,
                    messages=[
                        {"role": "system", "content": "You are a helpful document assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=500,
                    stream=True
                )
                
                for chunk in response:
                    if chunk.choices[0].delta.content:
                        yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"
                
                yield f"data: {json.dumps({'done': True})}\n\n"
                return
                
            except Exception as e:
                print(f"OpenAI streaming failed: {e}")
        
        # Non-streaming fallback for other providers
        response = self.generate(question, context_chunks, session_id)
        yield f"data: {json.dumps({'content': response})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"
    
    def _gemini_generate(self, prompt: str) -> str:
        """Generate using Google's Gemini API."""
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=self.gemini_key)
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        return response.text
    
    def _anthropic_generate(self, prompt: str) -> str:
        """Generate using Anthropic's Claude API."""
        import anthropic
        
        client = anthropic.Anthropic(api_key=self.anthropic_key)
        
        response = client.messages.create(
            model="claude-3-haiku-20240307",  # Fast, cheap model
            max_tokens=500,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return response.content[0].text
    
    def _ollama_generate(self, prompt: str) -> str:
        """Generate using local Ollama."""
        import requests
        
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "mistral",
                "prompt": prompt,
                "stream": False
            }
        )
        
        if response.status_code == 200:
            return response.json().get("response", "")
        else:
            raise Exception(f"Ollama error: {response.status_code}")
    
    def _fallback_response(self, question: str, chunks: List[Dict]) -> str:
        """
        Template-based fallback when no LLM is available.
        Demonstrates graceful degradation — a key TPM concern.
        """
        # Simple keyword matching
        question_lower = question.lower()
        relevant_sentences = []
        
        for chunk in chunks:
            sentences = chunk['text'].split('. ')
            for sent in sentences:
                # Check for keyword overlap
                sent_words = set(sent.lower().split())
                question_words = set(question_lower.split())
                
                if len(sent_words & question_words) > 0:
                    relevant_sentences.append(sent)
        
        if relevant_sentences:
            return (
                "Based on the documents, I found this relevant information:\n\n" +
                "\n".join(f"• {s}" for s in relevant_sentences[:3]) +
                "\n\n(Note: This is a keyword-matched fallback.) "
                """Set OPENAI_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY for full LLM responses.)"""
            )
        else:
            return "I couldn't find relevant information in the documents. Please try rephrasing your question or uploading more documents."