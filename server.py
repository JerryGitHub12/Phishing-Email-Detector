from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
import numpy as np

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailRequest(BaseModel):
    text: str


# Zero-shot classifier (DeBERTa-based model family)
classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli"
)

LABELS = ["phishing", "legitimate"]


@app.post("/analyze")
def analyze(email: EmailRequest):

    result = classifier(email.text, LABELS)

    probs = result["scores"]
    labels = result["labels"]

    score_map = dict(zip(labels, probs))

    legitimate = score_map.get("legitimate", 0)
    suspicious = score_map.get("suspicious", 0)
    phishing = score_map.get("phishing", 0)

    # risk based on highest probability

    threat_score = int(phishing * 100)

    if threat_score >= 70:
        risk = "phishing"
    elif threat_score >= 45:
        risk = "suspicious"
    else:
        risk = "legitimate"
    print(" EMAIL TEXT RECEIVED:", email.text[:200])
    print(" MODEL RAW OUTPUT:", result)

    print(" SCORES:", probs)
    print(" LABELS:", labels)

    print(" FINAL THREAT SCORE:", threat_score)
    print(" FINAL RISK:", risk)
    return {
        "risk": risk,
        "threat_score": threat_score,
        "breakdown": score_map
    }
#http://127.0.0.1:8000/docs
#python -m uvicorn server:app --reload --port 8000
#pip install fastapi uvicorn transformers torch scikit-learn pandas datasets numpy python-multipart