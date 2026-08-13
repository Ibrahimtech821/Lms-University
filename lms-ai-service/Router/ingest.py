from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import chromadb
from chromadb.utils import embedding_functions
from config import Internal_key, embeddingmodel, chroma_client

load_dotenv()

router = APIRouter()



splitter=RecursiveCharacterTextSplitter(chunk_size=700,chunk_overlap=30)

def load_chunk(pdf_path:str):
    loader=PyPDFLoader(pdf_path)
    file=loader.load()
    chunks=splitter.split_documents(file)
    return chunks
class IngestRequest(BaseModel):
    document_id:int
    course_id:int
    file_path:str

@router.post("/ingest")
def ingest(payload: IngestRequest, x_internal_key: str = Header(None)):
    if x_internal_key!=Internal_key:
        raise HTTPException(status_code=401)
    chunks=load_chunk(payload.file_path)
    collection = chroma_client.get_or_create_collection(
        name=f"course_{payload.course_id}",
        configuration={
            "hnsw": {
                "space": "cosine"
            }
        },
        embedding_function=embeddingmodel
    )
    collection.add(
        ids=[f"doc {payload.document_id} in chunk {i}" for i in range(len(chunks))],
        documents=[ c.page_content for c in chunks],
        metadatas=[{
            "document_id":payload.document_id,
            "page":c.metadata["page"] + 1

        }for c in chunks] )
    return {"status": "success", "chunks_created": len(chunks)}

