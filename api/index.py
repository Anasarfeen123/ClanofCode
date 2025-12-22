from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
import joblib
import os
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Symptom Disease Predictor",
    description="AI-powered symptom analysis API",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")

# Global model variables
acute_model = None
chronic_model = None
metadata = {}
acute_features = []
chronic_features = []

# Configuration
MIN_CONFIDENCE = 0.01
MAX_RESULTS = 5

class SymptomRequest(BaseModel):
    symptoms: dict[str, int] = Field(..., description="Symptom severity mapping")
    type: str = Field(..., description="Analysis type: acute, chronic, or not_sure")
    
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
            if not isinstance(severity, int) or severity < 0 or severity > 4:
                raise ValueError(f'Invalid severity for {symptom}: must be 0-4')
        return v

class PredictionResponse(BaseModel):
    predictions: list[dict]
    message: str = ""

def load_models():
    """Load ML models on startup"""
    global acute_model, chronic_model, metadata, acute_features, chronic_features
    
    try:
        acute_path = os.path.join(MODEL_DIR, "acute_model.joblib")
        chronic_path = os.path.join(MODEL_DIR, "chronic_model.joblib")
        metadata_path = os.path.join(MODEL_DIR, "feature_metadata.joblib")
        
        if not all(os.path.exists(p) for p in [acute_path, chronic_path, metadata_path]):
            logger.error("Model files not found")
            return False
        
        acute_model = joblib.load(acute_path)
        chronic_model = joblib.load(chronic_path)
        metadata = joblib.load(metadata_path)
        
        acute_features = metadata.get("acute_features", [])
        chronic_features = metadata.get("chronic_features", [])
        
        logger.info(f"Models loaded successfully")
        logger.info(f"Acute features: {len(acute_features)}, Chronic features: {len(chronic_features)}")
        return True
        
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        return False

@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    success = load_models()
    if not success:
        logger.warning("Application started without models")

@app.get("/")
async def root():
    """Health check endpoint"""
    models_loaded = acute_model is not None and chronic_model is not None
    return {
        "status": "running",
        "models_loaded": models_loaded,
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "acute_model_loaded": acute_model is not None,
        "chronic_model_loaded": chronic_model is not None,
        "acute_features_count": len(acute_features),
        "chronic_features_count": len(chronic_features)
    }

def build_input_vector(symptoms: dict, features: list) -> list:
    """Convert symptom dict to model input vector"""
    return [[1 if symptoms.get(f, 0) > 0 else 0 for f in features]]

def predict_with_model(model, symptoms: dict, features: list, model_type: str):
    """Make prediction with a single model"""
    try:
        X = build_input_vector(symptoms, features)
        probs = model.predict_proba(X)[0]
        diseases = model.classes_
        
        results = [
            {
                "condition": disease,
                "confidence": float(prob),
                "model": model_type
            }
            for disease, prob in zip(diseases, probs)
            if prob >= MIN_CONFIDENCE
        ]
        
        return results
        
    except Exception as e:
        logger.error(f"Error in {model_type} prediction: {e}")
        return []

@app.post("/api/predict", response_model=PredictionResponse)
async def predict(req: SymptomRequest):
    """
    Predict potential conditions based on symptoms
    
    - **symptoms**: Dictionary of symptom names to severity (0-4)
    - **type**: Analysis type (acute/chronic/not_sure)
    """
    
    # Check if models are loaded
    if not acute_model or not chronic_model:
        raise HTTPException(
            status_code=503,
            detail="Models not loaded. Please contact administrator."
        )
    
    # Validate we have symptoms
    if not req.symptoms:
        raise HTTPException(
            status_code=400,
            detail="No symptoms provided"
        )
    
    all_results = []
    
    # Run acute model
    if req.type in ["acute", "not_sure"] and acute_model:
        acute_results = predict_with_model(
            acute_model, 
            req.symptoms, 
            acute_features, 
            "acute"
        )
        all_results.extend(acute_results)
    
    # Run chronic model
    if req.type in ["chronic", "not_sure"] and chronic_model:
        chronic_results = predict_with_model(
            chronic_model,
            req.symptoms,
            chronic_features,
            "chronic"
        )
        all_results.extend(chronic_results)
    
    # Sort by confidence and limit results
    all_results.sort(key=lambda x: x["confidence"], reverse=True)
    top_results = all_results[:MAX_RESULTS]
    
    # Generate message
    message = ""
    if not top_results:
        message = "No clear matches found. Consider consulting a healthcare provider."
    elif top_results[0]["confidence"] < 0.3:
        message = "Low confidence results. Please provide more symptoms or consult a doctor."
    
    logger.info(f"Prediction completed: {len(top_results)} results returned")
    
    return PredictionResponse(
        predictions=top_results,
        message=message
    )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle unexpected errors"""
    logger.error(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred",
            "predictions": []
        }
    )