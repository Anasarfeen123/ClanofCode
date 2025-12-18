from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import os
from fastapi.middleware.cors import CORSMiddleware

# 1. Add root_path="/api" so FastAPI knows it's running under /api
app = FastAPI(title="Symptom Disease Predictor", root_path="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Update Model Directory Path
# Since we moved 'model' inside 'api', it is now in the same directory as this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model") 

try:
    acute_model = joblib.load(os.path.join(MODEL_DIR, "acute_model.joblib"))
    chronic_model = joblib.load(os.path.join(MODEL_DIR, "chronic_model.joblib"))
    metadata = joblib.load(os.path.join(MODEL_DIR, "feature_metadata.joblib"))
    print("Models loaded successfully.")
except FileNotFoundError as e:
    print(f"Error loading models: {e}. Ensure 'model' folder is inside 'api' folder.")
    raise e

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
    # CRITICAL FIX: The model was trained on binary data (0 or 1).
    # The frontend sends severity (1-4). We must convert severity to binary
    # for the LogisticRegression model to interpret it correctly.
    input_data = {
        f: 1 if symptoms.get(f, 0) > 0 else 0
        for f in features
    }
    return pd.DataFrame([input_data])

# =========================
# Prediction endpoint
# =========================
@app.post("/predict")
def predict(req: SymptomRequest):
    results = []

    # Predict using Acute Model
    if req.type in ["acute", "not_sure"]:
        X = build_input(req.symptoms, acute_features)
        probs = acute_model.predict_proba(X)[0]
        diseases = acute_model.classes_

        results += [
            {"disease": d, "prob": float(p), "model": "acute"}
            for d, p in zip(diseases, probs)
            if p >= MIN_CONFIDENCE
        ]

    # Predict using Chronic Model
    if req.type in ["chronic", "not_sure"]:
        X = build_input(req.symptoms, chronic_features)
        probs = chronic_model.predict_proba(X)[0]
        diseases = chronic_model.classes_

        results += [
            {"disease": d, "prob": float(p), "model": "chronic"}
            for d, p in zip(diseases, probs)
            if p >= MIN_CONFIDENCE
        ]

    # Sort by probability (descending)
    results = sorted(results, key=lambda x: x["prob"], reverse=True)

    return {
        "predictions": results[:5]
    }