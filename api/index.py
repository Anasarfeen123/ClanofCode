from fastapi import FastAPI
from pydantic import BaseModel
import joblib
# import pandas as pd  <-- REMOVE THIS
import os
from fastapi.middleware.cors import CORSMiddleware

# 1. Add root_path="/api"
app = FastAPI(title="Symptom Disease Predictor", root_path="/api")
# --- 2. ADD THIS BLOCK ---
origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # Allows the frontend to connect
    allow_credentials=True,
    allow_methods=["*"],        # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],        # Allows all headers
)
# -------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")

try:
    acute_model = joblib.load(os.path.join(MODEL_DIR, "acute_model.joblib"))
    chronic_model = joblib.load(os.path.join(MODEL_DIR, "chronic_model.joblib"))
    metadata = joblib.load(os.path.join(MODEL_DIR, "feature_metadata.joblib"))
    print("Models loaded successfully.")
except FileNotFoundError as e:
    print(f"Error loading models: {e}")
    raise e

acute_features = metadata["acute_features"]
chronic_features = metadata["chronic_features"]

MIN_CONFIDENCE = 0.05

class SymptomRequest(BaseModel):
    symptoms: dict[str, int]
    type: str

# =========================
# Helper (Updated to remove Pandas)
# =========================
def build_input(symptoms, features):
    # Create a simple list of values (0 or 1) in the exact order of 'features'
    # Scikit-learn models accept a list of lists (2D array)
    data_row = [1 if symptoms.get(f, 0) > 0 else 0 for f in features]
    return [data_row]

# =========================
# Prediction endpoint
# =========================
@app.post("/predict")
def predict(req: SymptomRequest):
    results = []

    # Predict using Acute Model
    if req.type in ["acute", "not_sure"]:
        X = build_input(req.symptoms, acute_features)
        # Pass the list directly to predict_proba
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

    results = sorted(results, key=lambda x: x["prob"], reverse=True)

    return {
        "predictions": results[:5]
    }