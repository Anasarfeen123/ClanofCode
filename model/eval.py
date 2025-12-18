import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score, f1_score

# Load models
lr_model = joblib.load("model/logistic_regression_model.joblib")
nb_model = joblib.load("model/naive_bayes_model.joblib")
metadata = joblib.load("model/model_metadata.joblib")

top_symptoms = metadata["top_symptoms"]

# Load data
df = pd.read_csv("clean_symptom_disease_dataset.csv")
X = df[top_symptoms]
y = df["disease"]

# Predictions
lr_pred = lr_model.predict(X)
nb_pred = nb_model.predict(X)

lr_probs = lr_model.predict_proba(X)
nb_probs = nb_model.predict_proba(X)

ensemble_probs = 0.5 * lr_probs + 0.5 * nb_probs
ensemble_pred = lr_model.classes_[np.argmax(ensemble_probs, axis=1)]

print("\n=== Evaluation Results ===")
print(f"LR Accuracy: {accuracy_score(y, lr_pred):.3f}")
print(f"NB Accuracy: {accuracy_score(y, nb_pred):.3f}")
print(f"Ensemble Accuracy: {accuracy_score(y, ensemble_pred):.3f}")

print(f"LR Macro F1: {f1_score(y, lr_pred, average='macro'):.3f}")
print(f"NB Macro F1: {f1_score(y, nb_pred, average='macro'):.3f}")
print(f"Ensemble Macro F1: {f1_score(y, ensemble_pred, average='macro'):.3f}")
