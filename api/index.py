from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import os
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI
# Removed root_path="/api" for easier local testing. 
# If deploying to Vercel, Vercel handles the path routing via vercel.json.
app = FastAPI(title="Symptom Disease Predictor")

# --- CORS SETTINGS ---
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
# ---------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")

# Load Models
try:
    acute_model = joblib.load(os.path.join(MODEL_DIR, "acute_model.joblib"))
    chronic_model = joblib.load(os.path.join(MODEL_DIR, "chronic_model.joblib"))
    metadata = joblib.load(os.path.join(MODEL_DIR, "feature_metadata.joblib"))
    print("Models loaded successfully.")
except FileNotFoundError as e:
    print(f"Error loading models: {e}")
    # In production, you might want to handle this more gracefully
    pass

acute_features = metadata.get("acute_features", [])
chronic_features = metadata.get("chronic_features", [])

MIN_CONFIDENCE = 0.01  # Lowered slightly to ensure results appear during testing

class SymptomRequest(BaseModel):
    symptoms: dict[str, int]
    type: str

# =========================
# Helper Function
# =========================
def build_input(symptoms, features):
    # Create a simple list of values (0 or 1) in the exact order of 'features'
    data_row = [1 if symptoms.get(f, 0) > 0 else 0 for f in features]
    # Scikit-learn models accept a 2D array (list of lists)
    return [data_row]

# =========================
# Prediction Endpoint
# =========================
@app.post("/predict")
def predict(req: SymptomRequest):
    results = []

    # 1. Predict using Acute Model
    if req.type in ["acute", "not_sure"] and acute_model:
        X = build_input(req.symptoms, acute_features)
        probs = acute_model.predict_proba(X)[0]
        diseases = acute_model.classes_

        results += [
            # CRITICAL FIX: keys must match what main.js expects (condition, confidence)
            {"condition": d, "confidence": float(p), "model": "acute"}
            for d, p in zip(diseases, probs)
            if p >= MIN_CONFIDENCE
        ]

    # 2. Predict using Chronic Model
    if req.type in ["chronic", "not_sure"] and chronic_model:
        X = build_input(req.symptoms, chronic_features)
        probs = chronic_model.predict_proba(X)[0]
        diseases = chronic_model.classes_

        results += [
            # CRITICAL FIX: keys must match what main.js expects (condition, confidence)
            {"condition": d, "confidence": float(p), "model": "chronic"}
            for d, p in zip(diseases, probs)
            if p >= MIN_CONFIDENCE
        ]

    # 3. Sort by confidence (highest first)
    results = sorted(results, key=lambda x: x["confidence"], reverse=True)

    # 4. Return top 5
    return {
        "predictions": results[:5]
    }