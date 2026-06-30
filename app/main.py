from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import os
import shutil

from app.ingest import read_pdf, split_text
from app.vectorstore import get_vector_db
from app.chatbot import ask_ai

app = FastAPI(title="AI Business SaaS")

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Setup ----------------
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ---------------- Upload PDF ----------------
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...), business_id: str = "default"):
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = read_pdf(filepath)
    chunks = split_text(text)

    vector_db = get_vector_db(business_id)

    vector_db.add_texts(
        texts=chunks,
        metadatas=[{"source": file.filename}] * len(chunks)
    )

    vector_db.persist()

    return {
        "message": "File uploaded and processed",
        "business_id": business_id,
        "chunks": len(chunks)
    }


# ---------------- Chat Endpoint ----------------
class Question(BaseModel):
    question: str


@app.post("/chat")
def chat(data: Question, business_id: str = "default"):
    answer = ask_ai(data.question, business_id)

    return {
        "answer": answer,
        "business_id": business_id
    }