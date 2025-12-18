from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Symptom Disease Predictor")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Load models & metadata
# =========================
acute_model = joblib.load("model/acute_model.joblib")
chronic_model = joblib.load("model/chronic_model.joblib")
metadata = joblib.load("model/feature_metadata.joblib")

acute_features = metadata["acute_features"]
chronic_features = metadata["chronic_features"]

MIN_CONFIDENCE = 0.05


# =========================
# Request schema
# =========================
class SymptomRequest(BaseModel):
    symptoms: dict[str, int]      # 0–4
    type: str                     # "acute" | "chronic" | "not_sure"

# =========================
# Helper
# =========================
def build_input(symptoms, features):
    return pd.DataFrame([{
        f: symptoms.get(f, 0)
        for f in features
    }])

# =========================
# Prediction endpoint
# =========================
@app.post("/predict")
def predict(req: SymptomRequest):
    results = []

    if req.type in ["acute", "not_sure"]:
        X = build_input(req.symptoms, acute_features)
        probs = acute_model.predict_proba(X)[0]
        diseases = acute_model.classes_

        results += [
            {"disease": d, "prob": float(p), "model": "acute"}
            for d, p in zip(diseases, probs)
            if p >= MIN_CONFIDENCE
        ]

    if req.type in ["chronic", "not_sure"]:
        X = build_input(req.symptoms, chronic_features)
        probs = chronic_model.predict_proba(X)[0]
        diseases = chronic_model.classes_

        results += [
            {"disease": d, "prob": float(p), "model": "chronic"}
            for d, p in zip(diseases, probs)
            if p >= MIN_CONFIDENCE
        ]

    results = sorted(results, key=lambda x: x["prob"], reverse=True)

    return {
        "predictions": results[:5]
    }
