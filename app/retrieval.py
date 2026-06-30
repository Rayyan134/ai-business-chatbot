from app.vectorstore import vector_db

def retrieve_context(query: str, k: int = 3):
    results = vector_db.similarity_search(query, k=k)

    print("DEBUG RESULTS:", results)

    context = "\n\n".join([doc.page_content for doc in results])

    print("DEBUG CONTEXT:", context)

    return context