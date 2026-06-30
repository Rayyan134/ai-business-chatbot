from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


def get_vector_db(business_id: str):
    return Chroma(
        persist_directory=f"chroma_db/{business_id}",
        embedding_function=embeddings
    )