import re
import io
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional

import pymupdf  # PyMuPDF

try:
    import docx
except ImportError:
    docx = None

# Comprehensive canonical skills dictionary organized by category
CANONICAL_SKILLS = {
    # Programming Languages
    "python": ["python", "py"],
    "javascript": ["javascript", "js", "ecmascript"],
    "typescript": ["typescript", "ts"],
    "java": ["java"],
    "c++": ["c++", "cpp"],
    "c#": ["c#", "csharp", ".net"],
    "c programming": ["c programming", "c language", "c"],
    "go": ["golang", "go language"],
    "rust": ["rust"],
    "php": ["php"],
    "ruby": ["ruby"],
    "sql": ["sql", "structured query language"],
    "r": ["r language", "r programming"],

    # AI / ML / Data Science
    "artificial intelligence": ["artificial intelligence", "ai", "artificial intelligence (ai & ml)"],
    "machine learning": ["machine learning", "ml", "machine learning fundamentals"],
    "deep learning": ["deep learning", "neural networks", "federated learning"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    "pytorch": ["pytorch", "torch"],
    "tensorflow": ["tensorflow", "tf", "keras"],
    "natural language processing": ["natural language processing", "nlp", "llm", "large language models"],
    "computer vision": ["computer vision", "opencv", "object detection"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "data analysis": ["data analysis", "data analytics", "eda"],
    "data visualization": ["data visualization", "matplotlib", "seaborn", "plotly"],
    "statistics": ["statistics", "statistical modeling", "hypothesis testing"],

    # Web & Full Stack
    "react": ["react", "react.js", "reactjs"],
    "next.js": ["next.js", "nextjs"],
    "angular": ["angular", "angularjs"],
    "vue": ["vue", "vue.js", "vuejs"],
    "node.js": ["node.js", "nodejs", "node"],
    "express": ["express", "express.js"],
    "fastapi": ["fastapi"],
    "flask": ["flask"],
    "django": ["django"],
    "tailwind": ["tailwind", "tailwind css", "tailwindcss"],
    "html": ["html", "html5"],
    "css": ["css", "css3", "sass", "scss"],
    "rest api": ["rest api", "restful", "restful api", "api design"],
    "api integration": ["api integration", "api integrations", "apis", "api"],
    "database management": ["database management", "database", "dbms"],
    "graphql": ["graphql"],

    # Database & Cloud & DevOps
    "postgresql": ["postgresql", "postgres"],
    "mysql": ["mysql"],
    "mongodb": ["mongodb", "mongo"],
    "redis": ["redis"],
    "docker": ["docker", "containerization"],
    "kubernetes": ["kubernetes", "k8s"],
    "aws": ["aws", "amazon web services", "s3", "ec2", "lambda"],
    "azure": ["azure", "microsoft azure"],
    "google cloud": ["gcp", "google cloud platform", "google cloud"],
    "git": ["git", "gitlab"],
    "github": ["github"],
    "internet of things": ["internet of things", "iot"],
    "ci/cd": ["ci/cd", "ci cd", "github actions", "jenkins"],
    "linux": ["linux", "bash", "unix"],

    # Soft & Professional Skills
    "problem-solving": ["problem-solving", "problem solving", "analytical thinking"],
    "communication": ["communication", "technical communication", "presentation skills"],
    "teamwork": ["teamwork", "cross-functional", "collaboration", "agile", "scrum"],
}

EDUCATION_PATTERNS = [
    r"(?i)\b(b\.?s\.?|bachelor(?:'s)?|b\.?tech|b\.?e\.?|undergraduate)\b[^\n,.]*(?:in|of)?\s+([A-Za-z\s]+)",
    r"(?i)\b(m\.?s\.?|master(?:'s)?|m\.?tech|m\.?e\.?|mba|postgraduate)\b[^\n,.]*(?:in|of)?\s+([A-Za-z\s]+)",
    r"(?i)\b(ph\.?d\.?|doctorate)\b[^\n,.]*(?:in|of)?\s+([A-Za-z\s]+)",
]

def normalize_text(text: str) -> str:
    """Normalize text for consistent parsing and matching."""
    text = text.lower()
    text = re.sub(r"[\t\r\f\v]+", " ", text)
    # preserve plus and sharp for c++, c#, and dots for node.js
    text = re.sub(r"[^a-z0-9+#.\s-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract clean text from PDF bytes using PyMuPDF."""
    text_chunks = []
    with pymupdf.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text = page.get_text()
            if text:
                text_chunks.append(text)
    return "\n".join(text_chunks).strip()

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract clean text from DOCX bytes with python-docx and XML fallback."""
    if docx:
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text]
            # extract text from tables as well
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text.strip():
                            paragraphs.append(cell.text.strip())
            return "\n".join(paragraphs).strip()
        except Exception:
            pass

    # Fallback to direct XML extraction from docx zip container
    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes)) as zf:
            xml_content = zf.read("word/document.xml")
            tree = ET.fromstring(xml_content)
            # Find all w:t text nodes
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            texts = [node.text for node in tree.findall('.//w:t', namespaces) if node.text]
            return "\n".join(texts).strip()
    except Exception as e:
        raise ValueError(f"Unable to parse DOCX document: {str(e)}")

def extract_text(filename: str, file_bytes: bytes) -> str:
    """Extract text according to file extension."""
    ext = Path(filename).suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext in [".docx", ".doc"]:
        return extract_text_from_docx(file_bytes)
    elif ext in [".txt", ".md"]:
        return file_bytes.decode("utf-8", errors="ignore").strip()
    else:
        raise ValueError(f"Unsupported file type: {ext}. Please upload a PDF or DOCX file.")

def detect_skills(text: str) -> List[str]:
    """Detect skills using canonical dictionary and synonym patterns."""
    clean_text = " " + normalize_text(text) + " "
    detected = set()

    for skill, synonyms in CANONICAL_SKILLS.items():
        for syn in synonyms:
            pattern = r"(?<![a-z0-9])" + re.escape(syn) + r"(?![a-z0-9])"
            if re.search(pattern, clean_text):
                detected.add(skill)
                break

    return sorted(list(detected))

def extract_email(text: str) -> Optional[str]:
    """Extract email address with regex."""
    pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
    matches = re.findall(pattern, text)
    return matches[0] if matches else None

def extract_phone(text: str) -> Optional[str]:
    """Extract phone number with international and domestic formats."""
    pattern = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"
    matches = re.findall(pattern, text)
    return matches[0] if matches else None

def extract_candidate_name(text: str, filename: str) -> str:
    """Extract candidate name heuristic from header lines or filename."""
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if lines:
        for line in lines[:5]:
            # Ignore lines that look like emails, urls, dates, or resume headers
            if "@" in line or "http" in line or len(line) > 50:
                continue
            if re.search(r"(?i)\b(resume|curriculum|vitae|cv|profile|page|work experience|experience|college projects|projects|education|skills|summary|hackathons|contact)\b", line):
                continue
            # Check if line looks like a human name (2-4 words, alphabet only)
            words = line.split()
            if 2 <= len(words) <= 4 and all(re.match(r"^[A-Z][a-zA-Z\.\'-]*$", w) for w in words):
                return line

    # Fallback to sanitizing filename
    clean_fn = Path(filename).stem
    clean_fn = re.sub(r"(?i)(resume|cv|_|\-|\.pdf|\.docx|[0-9]+)", " ", clean_fn)
    words = [w.capitalize() for w in clean_fn.split() if len(w) > 1]
    if len(words) >= 2:
        return " ".join(words[:3])
    elif len(words) == 1:
        return words[0]
    return "Candidate"

def estimate_experience_years(text: str) -> float:
    """Estimate years of experience from resume text."""
    # Look for explicit statements like "5+ years of experience"
    exp_patterns = [
        r"(\d+(?:\.\d+)?)\+?\s*years?(?:\s+of)?\s+experience",
        r"experience\s*(?:of)?\s*(\d+(?:\.\d+)?)\+?\s*years?",
    ]
    for pattern in exp_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                years = float(match.group(1))
                if 0 <= years <= 35:
                    return years
            except ValueError:
                pass

    # Look for employment date ranges (e.g., 2018 - 2023 or 2019 - Present)
    current_year = 2026
    year_ranges = re.findall(r"\b(20[0-2][0-9]|199[0-9])\s*(?:-|–|to)\s*(20[0-2][0-9]|present|current)\b", text, re.IGNORECASE)
    total_months = 0
    spans = []

    for start_str, end_str in year_ranges:
        try:
            start_year = int(start_str)
            end_year = current_year if end_str.lower() in ["present", "current"] else int(end_str)
            if start_year <= end_year and end_year <= current_year + 1:
                spans.append((start_year, end_year))
        except ValueError:
            continue

    if spans:
        # Merge overlapping spans to prevent double counting
        spans.sort()
        merged = [spans[0]]
        for current in spans[1:]:
            prev_start, prev_end = merged[-1]
            if current[0] <= prev_end:
                merged[-1] = (prev_start, max(prev_end, current[1]))
            else:
                merged.append(current)
        total_years = sum(end - start for start, end in merged)
        return float(min(total_years, 30))

    return 1.0  # Conservative baseline for fresh graduates / career changers

def extract_education(text: str) -> str:
    """Extract candidate highest educational credential."""
    for pattern in EDUCATION_PATTERNS:
        match = re.search(pattern, text)
        if match:
            degree_type = match.group(1).upper()
            major = match.group(2).strip()
            # Clean major trailing tokens
            major = re.split(r"[\n,\.;\(\)]", major)[0].strip()
            return f"{degree_type} in {major}" if major else degree_type

    # General fallback search
    degree_keywords = ["B.S.", "B.Tech", "B.E.", "Master", "M.S.", "M.Tech", "Ph.D", "Bachelor"]
    for deg in degree_keywords:
        if deg.lower() in text.lower():
            return f"Degree holder ({deg})"

    return "Education details available on resume"

def extract_evidence_snippets(text: str, skills: List[str]) -> List[Dict[str, str]]:
    """Extract verifiable sentence snippets demonstrating matched skills."""
    # Split text into sentences
    sentences = re.split(r"(?<=[.!?])\s+|\n+", text)
    snippets = []
    seen_skills = set()

    for skill in skills:
        if skill in seen_skills:
            continue
        synonyms = CANONICAL_SKILLS.get(skill, [skill])
        for sentence in sentences:
            sentence_clean = sentence.strip()
            if len(sentence_clean) < 25 or len(sentence_clean) > 280:
                continue
            # Check if any synonym is in this sentence
            norm_sent = " " + normalize_text(sentence_clean) + " "
            for syn in synonyms:
                pattern = r"(?<![a-z0-9])" + re.escape(syn) + r"(?![a-z0-9])"
                if re.search(pattern, norm_sent):
                    snippets.append({
                        "skill": skill,
                        "snippet": sentence_clean
                    })
                    seen_skills.add(skill)
                    break
            if skill in seen_skills:
                break

    return snippets
