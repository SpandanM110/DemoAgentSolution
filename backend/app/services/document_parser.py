import os
from pypdf import PdfReader
from docx import Document
import chardet

from app.config import get_settings


def extract_text(filepath: str) -> str:
    ext = os.path.splitext(filepath)[1].lower()

    if ext == ".pdf":
        return _extract_pdf(filepath)
    elif ext == ".docx":
        return _extract_docx(filepath)
    elif ext == ".txt":
        return _extract_txt(filepath)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def _extract_pdf(filepath: str) -> str:
    reader = PdfReader(filepath)
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    return _truncate("\n\n".join(pages))


def _extract_docx(filepath: str) -> str:
    doc = Document(filepath)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return _truncate("\n\n".join(paragraphs))


def _extract_txt(filepath: str) -> str:
    with open(filepath, "rb") as f:
        raw = f.read()
    detected = chardet.detect(raw)
    encoding = detected.get("encoding", "utf-8") or "utf-8"
    return _truncate(raw.decode(encoding, errors="replace"))


def _truncate(text: str) -> str:
    limit = get_settings().MAX_DOCUMENT_CHARS
    if len(text) > limit:
        return text[:limit] + "\n\n[... truncated ...]"
    return text
