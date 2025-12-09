"""
Modal.com deployment for PolicyPilot RAG Pipeline

Deploy with: modal deploy modal_app.py
Local test: modal serve modal_app.py

This exposes the Python pipeline as serverless HTTP endpoints.
"""

import modal
import os
import json
import tempfile
from pathlib import Path

# Define the Modal app
app = modal.App("policypilot-rag")

# Define the container image with all dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install([
        "fastapi",  # Required for @modal.fastapi_endpoint
        "pymongo",
        "supabase",
        "langchain-text-splitters",
        "langchain-community",
        "langchain-huggingface",
        "chromadb",
        "google-generativeai",
        "python-dotenv",
        "pypdf",
        "sentence-transformers",
    ])
)

@app.function(
    image=image,
    secrets=[modal.Secret.from_name("custom-secret")],  # Configure in Modal dashboard
    timeout=300,  # 5 minute timeout for long operations
)
@modal.fastapi_endpoint(method="POST")
async def analyze_case(request: dict):
    """
    Analyze a case using RAG pipeline.
    
    POST body: { "caseId": "string", "userId": "string" }
    Returns: { "analysis": "string", "terms": [...] }
    """
    from pipeline import get_vector_store, get_db_connection
    import google.generativeai as genai
    
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    
    case_id = request.get("caseId")
    user_id = request.get("userId")
    
    if not case_id or not user_id:
        return {"error": "caseId and userId are required"}
    
    try:
        # Get or create vector store
        db = get_vector_store(case_id, user_id, force_refresh=False)
        if not db:
            return {"error": "Failed to load or create vector store"}
        
        # Query for relevant context
        query = "denial reason policy coverage exclusions"
        results = db.similarity_search_with_relevance_scores(query, k=10)
        
        relevant_context = []
        for doc, score in results:
            if score >= 0.0:
                relevant_context.append(doc.page_content)
        
        if not relevant_context:
            return {"error": "No relevant policy sections found"}
        
        context_text = "\n\n".join(relevant_context)
        
        # Generate analysis with Gemini
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        You are an expert health insurance lawyer. Analyze the following context.
        
        Context:
        ---
        {context_text}
        ---
        
        Return a JSON object with:
        - "analysis": explanation in layman's terms
        - "terms": list of {{ "term": "string", "definition": "string" }}
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Parse JSON from response
        start_idx = text.find('{')
        end_idx = text.rfind('}')
        if start_idx != -1 and end_idx != -1:
            return json.loads(text[start_idx:end_idx+1])
        
        return {"error": "Failed to parse response", "raw": text}
        
    except Exception as e:
        return {"error": str(e)}


@app.function(
    image=image,
    secrets=[modal.Secret.from_name("custom-secret")],
    timeout=300,
)
@modal.fastapi_endpoint(method="POST")
async def extract_denial(request: dict):
    """
    Extract denial info from case files.
    
    POST body: { "caseId": "string" }
    Returns: { "briefDescription": "string" }
    """
    from pipeline import get_db_connection, get_supabase_client
    from langchain_community.document_loaders import PyPDFLoader
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain_community.vectorstores import Chroma
    import google.generativeai as genai
    
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    
    case_id = request.get("caseId")
    if not case_id:
        return {"error": "caseId is required"}
    
    try:
        db = get_db_connection()
        case = db.cases.find_one({"id": case_id})
        
        if not case:
            return {"error": "Case not found"}
        
        if not case.get("denialFiles"):
            return {"error": "No denial files found"}
        
        # Check cache
        if case.get("denialReasonTitle"):
            return {"briefDescription": case["denialReasonTitle"]}
        
        # Process files and extract text
        sb = get_supabase_client()
        docs = []
        
        for file_data in case["denialFiles"]:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                if file_data.get("path") and sb:
                    bucket = file_data.get("bucket", "denials")
                    data = sb.storage.from_(bucket).download(file_data["path"])
                    tmp.write(data)
                elif file_data.get("data"):
                    tmp.write(bytes(file_data["data"]))
                else:
                    continue
                tmp.flush()
                
                try:
                    loader = PyPDFLoader(tmp.name)
                    docs.extend(loader.load())
                finally:
                    os.unlink(tmp.name)
        
        if not docs:
            return {"error": "No documents loaded"}
        
        # Create embeddings and query
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)
        chunks = text_splitter.split_documents(docs)
        
        embedding_function = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vector_db = Chroma.from_documents(documents=chunks, embedding=embedding_function)
        
        results = vector_db.similarity_search("denial reason", k=10)
        context_text = "\n\n".join([doc.page_content for doc in results])
        
        # Generate brief description
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        prompt = f"""
        Create a brief 1-sentence description (under 15 words) of why this claim was denied.
        
        Context:
        ---
        {context_text}
        ---
        
        Return JSON: {{"briefDescription": "string"}}
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip().replace('```json', '').replace('```', '')
        result = json.loads(text)
        
        # Cache the result
        db.cases.update_one(
            {"id": case_id},
            {"$set": {"denialReasonTitle": result.get("briefDescription")}}
        )
        
        return result
        
    except Exception as e:
        return {"error": str(e)}


@app.function(
    image=image,
    secrets=[modal.Secret.from_name("custom-secret")],
    timeout=300,
)
@modal.fastapi_endpoint(method="POST")
async def generate_email(request: dict):
    """
    Generate appeal email draft.
    
    POST body: { "caseId": "string", "userId": "string" }
    Returns: { "emailDraft": { "subject": "string", "body": "string" } }
    """
    from pipeline import get_vector_store, get_db_connection
    import google.generativeai as genai
    
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    
    case_id = request.get("caseId")
    user_id = request.get("userId")
    
    if not case_id or not user_id:
        return {"error": "caseId and userId are required"}
    
    try:
        # Check cache
        mongo_db = get_db_connection()
        case = mongo_db.cases.find_one({"id": case_id})
        if case and case.get("emailDraft", {}).get("body"):
            return {"emailDraft": case["emailDraft"]}
        
        # Get vector store
        db = get_vector_store(case_id, user_id, force_refresh=False)
        if not db:
            return {"error": "Failed to load vector store"}
        
        query = "denial reason policy coverage exclusions"
        results = db.similarity_search_with_relevance_scores(query, k=10)
        
        relevant_context = [doc.page_content for doc, score in results if score >= 0.0]
        if not relevant_context:
            return {"error": "No relevant context found"}
        
        context_text = "\n\n".join(relevant_context)
        
        # Generate email with Gemini
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        prompt = f"""
        Draft body paragraphs for a professional insurance appeal email.
        You are a Health Insurance Denial Lawyer.
        
        Context:
        ---
        {context_text}
        ---
        
        Return JSON: {{"body": "string"}}
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        start_idx = text.find('{')
        end_idx = text.rfind('}')
        
        if start_idx != -1 and end_idx != -1:
            email_json = json.loads(text[start_idx:end_idx+1])
        else:
            email_json = {"body": text}
        
        return {"emailDraft": email_json}
        
    except Exception as e:
        return {"error": str(e)}


@app.function(
    image=image,
    secrets=[modal.Secret.from_name("custom-secret")],
    timeout=300,
)
@modal.fastapi_endpoint(method="POST")
async def generate_followup(request: dict):
    """
    Generate follow-up email based on email thread.
    
    POST body: { "caseId": "string", "emailThread": [...] }
    Returns: { "emailDraft": { "subject": "string", "body": "string" } }
    """
    import google.generativeai as genai
    
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    
    case_id = request.get("caseId")
    email_thread = request.get("emailThread", [])
    
    if not case_id:
        return {"error": "caseId is required"}
    
    try:
        thread_summary = "\n\n---\n\n".join([
            f"[{e.get('type', 'unknown').upper()}] {e.get('date', '')}\n{e.get('body', '')}"
            for e in email_thread
        ])
        
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        prompt = f"""
        Write a professional follow-up email responding to the latest message.
        
        Email Thread:
        {thread_summary}
        
        Return JSON: {{"subject": "string", "body": "string"}}
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        start_idx = text.find('{')
        end_idx = text.rfind('}')
        
        if start_idx != -1 and end_idx != -1:
            return {"emailDraft": json.loads(text[start_idx:end_idx+1])}
        
        return {"emailDraft": {"subject": "Re: Appeal Follow-up", "body": text}}
        
    except Exception as e:
        return {"error": str(e)}


@app.function(
    image=image,
    secrets=[modal.Secret.from_name("custom-secret")],
    timeout=300,
)
@modal.fastapi_endpoint(method="POST")
async def extract_plan(request: dict):
    """
    Extract insurance plan details from policy document files.
    
    POST body: { "files": [{ "name": "file.pdf", "data": "base64-encoded-data" }] }
    Returns: { "insuranceCompany": "string", "planName": "string", "policyNumber": "string" }
    """
    from langchain_community.document_loaders import PyPDFLoader
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain_community.vectorstores import Chroma
    import google.generativeai as genai
    import base64
    
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    
    files = request.get("files", [])
    if not files:
        return {"error": "No files provided"}
    
    try:
        docs = []
        
        # Process each base64-encoded file
        for file_info in files:
            file_name = file_info.get("name", "document.pdf")
            file_data_b64 = file_info.get("data", "")
            
            if not file_data_b64:
                continue
                
            # Decode base64 to bytes
            file_bytes = base64.b64decode(file_data_b64)
            
            # Write to temp file and load
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(file_bytes)
                tmp.flush()
                
                try:
                    loader = PyPDFLoader(tmp.name)
                    docs.extend(loader.load())
                finally:
                    os.unlink(tmp.name)
        
        if not docs:
            return {"error": "No documents could be loaded"}
        
        # Create embeddings and query
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)
        chunks = text_splitter.split_documents(docs)
        
        embedding_function = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vector_db = Chroma.from_documents(documents=chunks, embedding=embedding_function)
        
        # Query for plan details
        results = vector_db.similarity_search("insurance company name plan name policy number", k=10)
        context_text = "\n\n".join([doc.page_content for doc in results])
        
        # Generate extraction with Gemini
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        prompt = f"""
        Extract the following insurance plan details from the context:
        1. Insurance Company Name
        2. Plan Name
        3. Policy Number (Member ID, Subscriber ID, or Policy ID)

        Context:
        ---
        {context_text}
        ---

        Return ONLY a JSON object with keys: 'insuranceCompany', 'planName', 'policyNumber'.
        If a field is not found, use "Unknown".
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip().replace('```json', '').replace('```', '')
        
        return json.loads(text)
        
    except Exception as e:
        return {"error": str(e)}


@app.function(image=image)
@modal.fastapi_endpoint(method="GET")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "policypilot-rag"}

