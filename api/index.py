from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import os
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI
app = FastAPI(title="Symptom Disease Predictor")

# --- FIX: ALLOW ALL ORIGINS FOR VERCEL ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (safest for hackathon/vercel)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")

# Load Models (Silent fail safe for production)
acute_model = None
chronic_model = None
metadata = {}

try:
    acute_model = joblib.load(os.path.join(MODEL_DIR, "acute_model.joblib"))
    chronic_model = joblib.load(os.path.join(MODEL_DIR, "chronic_model.joblib"))
    metadata = joblib.load(os.path.join(MODEL_DIR, "feature_metadata.joblib"))
    print("Models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")

acute_features = metadata.get("acute_features", [])
chronic_features = metadata.get("chronic_features", [])
MIN_CONFIDENCE = 0.01

class SymptomRequest(BaseModel):
    symptoms: dict[str, int]
    type: str

def build_input(symptoms, features):
    return [[1 if symptoms.get(f, 0) > 0 else 0 for f in features]]

# --- FIX: CHANGED ROUTE TO /api/predict ---
# This ensures it matches both the local request (http://127.0.0.1:8000/api/predict)
# AND the Vercel rewrite (domain.com/api/predict)
@app.post("/api/predict")
def predict(req: SymptomRequest):
    results = []

    if req.type in ["acute", "not_sure"] and acute_model:
        try:
            X = build_input(req.symptoms, acute_features)
            probs = acute_model.predict_proba(X)[0]
            diseases = acute_model.classes_
            results += [{"condition": d, "confidence": float(p), "model": "acute"} for d, p in zip(diseases, probs) if p >= MIN_CONFIDENCE]
        except Exception as e:
            print(f"Acute model error: {e}")

    if req.type in ["chronic", "not_sure"] and chronic_model:
        try:
            X = build_input(req.symptoms, chronic_features)
            probs = chronic_model.predict_proba(X)[0]
            diseases = chronic_model.classes_
            results += [{"condition": d, "confidence": float(p), "model": "chronic"} for d, p in zip(diseases, probs) if p >= MIN_CONFIDENCE]
        except Exception as e:
            print(f"Chronic model error: {e}")

    results = sorted(results, key=lambda x: x["confidence"], reverse=True)

    return {"predictions": results[:5]}