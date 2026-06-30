from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter


def read_pdf(filepath):
    reader = PdfReader(filepath)

    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"

    return text


def split_text(text):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    return splitter.split_text(text)