from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from contextlib import asynccontextmanager
from typing import Dict, List, Optional
import joblib
import os
import logging
import time

# ==========================================
# 1. Configuration & Logging
# ==========================================

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger("symptom-predictor")

class Settings:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_DIR = os.path.join(BASE_DIR, "model")
    MIN_CONFIDENCE = 0.01
    MAX_RESULTS = 5
    ACUTE_MODEL_PATH = os.path.join(MODEL_DIR, "acute_model.joblib")
    CHRONIC_MODEL_PATH = os.path.join(MODEL_DIR, "chronic_model.joblib")
    METADATA_PATH = os.path.join(MODEL_DIR, "feature_metadata.joblib")

settings = Settings()

# ==========================================
# 2. Data Models (Schemas)
# ==========================================

class SymptomRequest(BaseModel):
    symptoms: Dict[str, int] = Field(..., description="Symptom severity mapping (symptom_name: severity_0_to_4)")
    type: str = Field(..., description="Analysis type: 'acute', 'chronic', or 'not_sure'")
    
    @validator('type')
    def validate_type(cls, v):
        if v not in ['acute', 'chronic', 'not_sure']:
            raise ValueError('Type must be acute, chronic, or not_sure')
        return v
    
    @validator('symptoms')
    def validate_symptoms(cls, v):
        if not v:
            raise ValueError('At least one symptom must be provided')
        for symptom, severity in v.items():
            if not isinstance(severity, int) or not (0 <= severity <= 4):
                raise ValueError(f'Invalid severity for {symptom}: must be integer 0-4')
        return v

class PredictionResult(BaseModel):
    condition: str
    confidence: float
    model: str

class PredictionResponse(BaseModel):
    predictions: List[PredictionResult]
    message: str = ""

# ==========================================
# 3. Application Lifecycle & State
# ==========================================

def load_ml_resources(app: FastAPI):
    """Load ML models and metadata into app state."""
    logger.info("Loading ML models...")
    app.state.models = {}
    app.state.features = {}
    
    files_exist = all(os.path.exists(p) for p in [
        settings.ACUTE_MODEL_PATH, 
        settings.CHRONIC_MODEL_PATH, 
        settings.METADATA_PATH
    ])

    if not files_exist:
        logger.error(f"Model files missing in {settings.MODEL_DIR}")
        return

    try:
        app.state.models["acute"] = joblib.load(settings.ACUTE_MODEL_PATH)
        app.state.models["chronic"] = joblib.load(settings.CHRONIC_MODEL_PATH)
        
        metadata = joblib.load(settings.METADATA_PATH)
        app.state.features["acute"] = metadata.get("acute_features", [])
        app.state.features["chronic"] = metadata.get("chronic_features", [])

        logger.info("Models loaded successfully.")
        logger.info(f"Features - Acute: {len(app.state.features['acute'])}, Chronic: {len(app.state.features['chronic'])}")
    except Exception as e:
        logger.error(f"Failed to load models: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    load_ml_resources(app)
    yield
    # Shutdown logic (cleanup if needed)
    app.state.models.clear()

# ==========================================
# 4. App Initialization
# ==========================================

app = FastAPI(
    title="Symptom Disease Predictor",
    description="AI-powered symptom analysis API",
    version="1.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 5. Prediction Logic
# ==========================================

def build_input_vector(symptoms: Dict[str, int], features: List[str]) -> List[List[int]]:
    """
    Convert symptom dict to model input vector.
    Logic: Checks if symptom is present (>0) in the input dictionary.
    """
    # Note: This aligns with features matching exact keys. 
    # Ensure frontend sends keys that match trained features.
    return [[1 if symptoms.get(f, 0) > 0 else 0 for f in features]]

def run_inference(model, symptoms: Dict[str, int], features: List[str], model_type: str) -> List[Dict]:
    """Helper to run prediction on a specific model."""
    try:
        X = build_input_vector(symptoms, features)
        # predict_proba returns array of arrays, we take the first one
        probs = model.predict_proba(X)[0]
        diseases = model.classes_
        
        results = []
        for disease, prob in zip(diseases, probs):
            if prob >= settings.MIN_CONFIDENCE:
                results.append({
                    "condition": disease,
                    "confidence": float(prob),
                    "model": model_type
                })
        return results
    except Exception as e:
        logger.error(f"Inference error ({model_type}): {e}")
        return []

# ==========================================
# 6. Endpoints
# ==========================================

@app.get("/")
async def root(request: Request):
    """Health check endpoint."""
    models_loaded = (
        request.app.state.models.get("acute") is not None and 
        request.app.state.models.get("chronic") is not None
    )
    return {
        "status": "running",
        "models_loaded": models_loaded,
        "version": app.version
    }

@app.get("/api/health")
async def health_check(request: Request):
    """Detailed health check."""
    return {
        "status": "healthy",
        "acute_model_loaded": request.app.state.models.get("acute") is not None,
        "chronic_model_loaded": request.app.state.models.get("chronic") is not None,
        "acute_features_count": len(request.app.state.features.get("acute", [])),
        "chronic_features_count": len(request.app.state.features.get("chronic", []))
    }

@app.post("/api/predict", response_model=PredictionResponse)
def predict(req: SymptomRequest, request: Request):
    """
    Predict potential conditions based on symptoms.
    
    NOTE: This function is defined with `def` (synchronous) instead of `async def`.
    This tells FastAPI to run it in a thread pool, which is crucial because
    scikit-learn predictions are CPU-bound and blocking.
    """
    start_time = time.time()
    
    acute_model = request.app.state.models.get("acute")
    chronic_model = request.app.state.models.get("chronic")
    
    if not acute_model or not chronic_model:
        raise HTTPException(
            status_code=503, 
            detail="Models not initialized. Contact administrator."
        )
    
    all_results = []
    
    # 1. Run Acute Model
    if req.type in ["acute", "not_sure"]:
        results = run_inference(
            acute_model, 
            req.symptoms, 
            request.app.state.features.get("acute", []), 
            "acute"
        )
        all_results.extend(results)
    
    # 2. Run Chronic Model
    if req.type in ["chronic", "not_sure"]:
        results = run_inference(
            chronic_model, 
            req.symptoms, 
            request.app.state.features.get("chronic", []), 
            "chronic"
        )
        all_results.extend(results)
    
    # 3. Post-process
    # Sort by confidence descending
    all_results.sort(key=lambda x: x["confidence"], reverse=True)
    
    # Limit results
    top_results = all_results[:settings.MAX_RESULTS]
    
    # Generate user message
    message = ""
    if not top_results:
        message = "No clear matches found. Consider consulting a healthcare provider."
    elif top_results[0]["confidence"] < 0.3:
        message = "Low confidence results. Please provide more symptoms or consult a doctor."
    
    duration = (time.time() - start_time) * 1000
    logger.info(f"Prediction: {len(top_results)} results in {duration:.2f}ms")
    
    return {
        "predictions": top_results,
        "message": message
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error handler caught: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred.",
            "predictions": [],
            "message": "System error. Please try again later."
        }
    )