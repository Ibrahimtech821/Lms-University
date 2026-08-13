from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains import ConversationalRetrievalChain
from langchain_classic.memory import ConversationBufferMemory
from config import Internal_key


router=APIRouter()

class Queryrequest(BaseModel):
    question:str
    course_id:int
    document_id:int|None=None
    conversation_id:int

memories = {}

def get_memory(conversation_id: int):
    if conversation_id not in memories:
        memories[conversation_id] = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )

    return memories[conversation_id]



@router.post('/query')
def query(payload:Queryrequest,x_internal_key:str=Header(None)):
    if x_internal_key!=Internal_key:
            raise HTTPException(status_code=401)
    embeddingmodel=HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2"
    )
    vectordb=Chroma(
         collection_name=f"course_{payload.course_id}",
         embedding_function=embeddingmodel,
         persist_directory="./chromadb"         
    )
    memory = get_memory(payload.conversation_id)
    search_kwargs={"k": 5 }
    if payload.document_id is not None:
        search_kwargs["filter"] = {
        "document_id": payload.document_id
    }
    retriever=vectordb.as_retriever(
          search_kwargs=search_kwargs
         

    )

    llm=ChatGoogleGenerativeAI(
        model="gemini-3.6-flash"
    )

    prompt=ChatPromptTemplate.from_template("""

    you are an AI assistant you try help students in understanding the course lectures and give them clear explaination to all things they ask about , 
    give answer only based on the context and  and try to be more intellgent not so strict if he change a word or miss vocab try to predict it based on the content ,if you don't know just say I don't Know 😊

    context:{context}

    Question:
    {question}


    """)



    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        memory=memory,
        combine_docs_chain_kwargs={
            "prompt": prompt
        }
    )

    
    result = qa_chain.invoke({
        "question": payload.question
    })

    return {
        "answer": result["answer"]
    }