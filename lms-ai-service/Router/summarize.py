from langchain_core.prompts import ChatPromptTemplate ,PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel
from fastapi import APIRouter, Header, HTTPException
from config import Internal_key
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda

router=APIRouter()

class summarize(BaseModel):
    course_id:int
    document_id:int
embeddingmodel=HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

@router.post("/summarize")
def summarize(payload:summarize,x_internal_key:str=Header(None)):
    if x_internal_key != Internal_key:
        raise HTTPException(status_code=401)
    vectordb=Chroma(
        collection_name=f"course_{payload.course_id}",
        embedding_function=embeddingmodel,
        persist_directory="./chromadb"
    )

    retierver=vectordb.as_retriever(search_kwargs={
            "k":20,
            "filter":{
                "document_id":payload.document_id
            }})

    

    prompt=PromptTemplate(
        template=
        """you are an AI assistant you try to summarize the lecture or the course based on the material , only based on the context of Course
            Summarize the lecture below.

        Include:
        - Main concepts
        - Important definitions
        - Important examples
        - Important points to remember

        Lecture:{content}
        """
        
    )

    llm=ChatGoogleGenerativeAI(
        model="gemini-3.6-flash"
    )

    documents_to_text = RunnableLambda(
    lambda docs: "\n\n".join(
        doc.page_content for doc in docs
    )
    )

    rag_chain=(
        retierver|
        documents_to_text|
        prompt|
        llm|
        StrOutputParser()

    )

    results=rag_chain.invoke("summarize")

    return {
        "summary": results
    }











