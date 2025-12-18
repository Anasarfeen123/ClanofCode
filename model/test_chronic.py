import joblib
import pandas as pd
import numpy as np

MIN_CONFIDENCE = 0.05

# =====================================================
# Load chronic model & metadata
# =====================================================
chronic_model = joblib.load("model/chronic_model.joblib")
metadata = joblib.load("model/feature_metadata.joblib")

chronic_features = metadata["chronic_features"]

print("Chronic model loaded")
print("Number of chronic features:", len(chronic_features))

# =====================================================
# Chronic prediction function
# =====================================================
def predict_chronic(user_answers, top_k=5):
    input_vector = {
        f: user_answers.get(f, 0)
        for f in chronic_features
    }

    X = pd.DataFrame([input_vector])

    probs = chronic_model.predict_proba(X)[0]
    diseases = chronic_model.classes_

    ranked = sorted(
        zip(diseases, probs),
        key=lambda x: x[1],
        reverse=True
    )

    return [(d, p) for d, p in ranked if p >= MIN_CONFIDENCE][:top_k]


# =====================================================
# Example CHRONIC input
# =====================================================
example_input = {
    "excessive_hunger": 4,
    "polyuria": 2,
    "increased_appetite": 3,
    "weight_loss": 2,
    "fatigue": 4
}

# =====================================================
# Run CHRONIC prediction
# =====================================================
print("\n=== CHRONIC PREDICTION ===")
for d, p in predict_chronic(example_input):
    print(f"{d}: {p:.3f}")