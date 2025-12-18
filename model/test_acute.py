import joblib
import pandas as pd
import numpy as np

MIN_CONFIDENCE = 0.05

# =====================================================
# Load acute model & metadata
# =====================================================
acute_model = joblib.load("model/acute_model.joblib")
metadata = joblib.load("model/feature_metadata.joblib")

acute_features = metadata["acute_features"]

print("Acute model loaded")
print("Number of acute features:", len(acute_features))

# =====================================================
# Acute prediction function
# =====================================================
def predict_acute(user_answers, top_k=5):
    input_vector = {
        f: user_answers.get(f, 0)
        for f in acute_features
    }

    X = pd.DataFrame([input_vector])

    probs = acute_model.predict_proba(X)[0]
    diseases = acute_model.classes_

    ranked = sorted(
        zip(diseases, probs),
        key=lambda x: x[1],
        reverse=True
    )

    return [(d, p) for d, p in ranked if p >= MIN_CONFIDENCE][:top_k]


# =====================================================
# Example ACUTE input
# =====================================================
acute_test_3 = {
    "abdominal_pain": 4,
    "nausea": 3,
    "vomiting": 3,
    "diarrhoea": 3,
    "loss_of_appetite": 2,
    "dehydration": 2
}




# =====================================================
# Run ACUTE prediction
# =====================================================
print("\n=== ACUTE PREDICTION ===")
for d, p in predict_acute(acute_test_3):
    print(f"{d}: {p:.3f}")
