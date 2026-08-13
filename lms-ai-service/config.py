from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv
import chromadb
from chromadb.utils import embedding_functions

load_dotenv()

Internal_key=os.getenv("INTERNAL_API_KEY")


embeddingmodel= embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)
chroma_client=chromadb.PersistentClient("./chromadb")