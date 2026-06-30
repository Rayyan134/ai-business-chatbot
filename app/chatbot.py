import google.generativeai as genai
from app.config import GEMINI_API_KEY
from app.vectorstore import get_vector_db

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")


def retrieve_context(question: str, business_id: str):
    vector_db = get_vector_db(business_id)

    results = vector_db.similarity_search(question, k=3)

    return "\n\n".join([doc.page_content for doc in results])


def ask_ai(question: str, business_id: str):
    context = retrieve_context(question, business_id)

    prompt = f"""
You are a professional AI assistant for a business.

Use ONLY the context below to answer the question.
If the answer is not in the context, say:
"I don't have enough information from the documents."

CONTEXT:
{context}

QUESTION:
{question}
"""

    response = model.generate_content(prompt)
    return response.text