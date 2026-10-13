
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import sys
import re
import joblib
from io import BytesIO
from pathlib import Path

from pypdf import PdfReader
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer


# =========================
# Paths
# =========================

BASE_DIR = Path(__file__).resolve().parent.parent
SRC_PATH = BASE_DIR / "src"
MODELS_PATH = BASE_DIR / "models"

if str(SRC_PATH) not in sys.path:
    sys.path.append(str(SRC_PATH))


# =========================
# Project imports
# =========================

from skill_extraction import extract_skills
from job_analyzer import analyze_job_description


# =========================
# App
# =========================

app = FastAPI(title="TalentAI API")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8443",
        "http://127.0.0.1:8443",
        "http://0.0.0.0:8443",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# Load ML artifacts
# =========================

import __main__


def technical_tokenizer(text):
    return re.findall(
        r"(?u)(?:[a-zA-Z]+\+\+|[a-zA-Z]+#|\.[a-zA-Z]+|[a-zA-Z]+\.[a-zA-Z]+|\w+)",
        text
    )


__main__.technical_tokenizer = technical_tokenizer


tfidf_vectorizer = joblib.load(
    MODELS_PATH / "tfidf_vectorizer.joblib"
)

embedding_model = SentenceTransformer(
    str(MODELS_PATH / "all-MiniLM-L6-v2")
)


# =========================
# Skills
# =========================

skill_list = [
    "python", "java", "javascript", "typescript",
    "c++", "c#", ".net", "asp.net",
    "node.js", "php", "ruby", "rust", "golang",
    "sql", "mysql", "postgresql", "mongodb", "oracle",
    "android", "ios", "flutter",
    "react", "angular", "vue",
    "django", "flask", "spring", "spring boot",
    "tensorflow", "pytorch", "scikit-learn",
    "machine learning", "deep learning",
    "data science", "data analysis",
    "nlp", "computer vision",
    "docker", "kubernetes", "aws", "azure",
    "git", "github",
    "rest api", "graphql",
    "html", "css", "figma",
    "power bi", "tableau"
]


skill_aliases = {
    "asp.net": [
        "asp.net", "aspnet", "asp.net core",
        "asp net", "asp net core"
    ],
    "node.js": [
        "node.js", "nodejs", "node js"
    ],
    "rest api": [
        "rest api", "rest apis", "restful api",
        "restful apis", "restful", "rest services"
    ],
    "scikit-learn": [
        "scikit-learn", "sklearn", "scikit learn"
    ],
    "machine learning": [
        "machine learning", "machine-learning", "ml"
    ],
    "deep learning": [
        "deep learning", "deep-learning", "dl"
    ],
    "data science": [
        "data science"
    ],
    "data analysis": [
        "data analysis"
    ],
    "computer vision": [
        "computer vision"
    ],
    "spring boot": [
        "spring boot", "springboot"
    ],
    "react": [
        "react", "react.js", "reactjs"
    ]
}


# =========================
# Routes
# =========================

@app.get("/")
def root():
    return {
        "message": "TalentAI API is running"
    }


@app.post("/assistant")
async def assistant(
    cv: UploadFile = File(...),
    job_description: str = Form(...)
):

    # -------------------------
    # Read CV
    # -------------------------

    cv_content = await cv.read()
    filename = (cv.filename or "").lower()

    if filename.endswith(".pdf"):
        try:
            pdf_reader = PdfReader(BytesIO(cv_content))

            cv_text = "\n".join(
                page.extract_text() or ""
                for page in pdf_reader.pages
            )

        except Exception as exc:
            return {
                "error": "Could not read the uploaded PDF.",
                "details": str(exc)
            }

    elif filename.endswith(".txt"):
        cv_text = cv_content.decode(
            "utf-8",
            errors="ignore"
        )

    else:
        return {
            "error": "Unsupported file type. Please upload a PDF or TXT file."
        }

    cv_text = re.sub(r"\s+", " ", cv_text).strip()
    cv_text_nlp = cv_text.lower()

    if not cv_text:
        return {
            "error": (
                "No text could be extracted from this CV. "
                "If the PDF contains scanned images, OCR is required."
            )
        }

    # -------------------------
    # Extract candidate skills
    # -------------------------

    candidate_skills = extract_skills(
        cv_text,
        skill_list,
        skill_aliases
    )

    # -------------------------
    # Analyze job description
    # -------------------------

    job_analysis = analyze_job_description(
        job_description,
        skill_list,
        skill_aliases
    )

    required_skills = job_analysis["Required_Skills"]

    matched_skills = [
        skill
        for skill in required_skills
        if skill in candidate_skills
    ]

    missing_skills = [
        skill
        for skill in required_skills
        if skill not in candidate_skills
    ]

    # -------------------------
    # TF-IDF similarity
    # -------------------------

    candidate_vector = tfidf_vectorizer.transform(
        [cv_text_nlp]
    )

    job_vector = tfidf_vectorizer.transform(
        [job_description.lower()]
    )

    tfidf_score = cosine_similarity(
        candidate_vector,
        job_vector
    )[0][0]

    # -------------------------
    # Semantic similarity
    # -------------------------

    candidate_embedding = embedding_model.encode(
        cv_text_nlp,
        convert_to_tensor=True
    )

    job_embedding = embedding_model.encode(
        job_description.lower(),
        convert_to_tensor=True
    )

    semantic_score = cosine_similarity(
        candidate_embedding.cpu().numpy().reshape(1, -1),
        job_embedding.cpu().numpy().reshape(1, -1)
    )[0][0]

    # -------------------------
    # Required skill coverage
    # -------------------------

    required_match_count = len(matched_skills)
    required_total = len(required_skills)

    skill_coverage = (
        required_match_count / required_total
        if required_total
        else 0.0
    )

    # -------------------------
    # Final score
    # -------------------------

    final_score = (
        0.10 * float(tfidf_score)
        + 0.35 * float(semantic_score)
        + 0.55 * float(skill_coverage)
    )

    # -------------------------
    # Response
    # -------------------------

    return {
        "filename": cv.filename,
        "required_skills": required_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "candidate_skills": candidate_skills,
        "tfidf_score": round(float(tfidf_score), 4),
        "semantic_score": round(float(semantic_score), 4),
        "skill_coverage": round(float(skill_coverage), 4),
        "final_match_score": round(final_score * 100, 2)
    }
