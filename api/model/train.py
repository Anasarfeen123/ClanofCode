import pandas as pd
import numpy as np
import joblib
import os
import re

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.feature_selection import mutual_info_classif
from sklearn.metrics import accuracy_score, f1_score

# Get absolute path to the project root to find csv
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(BASE_DIR))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
DATA_PATH = os.path.join(DATA_DIR, "symp_data.csv")

RANDOM_STATE = 18
DISEASE_TYPE_RAW = {
    # Chronic
    "aids": "chronic",
    "diabetes": "chronic",
    "hypertension": "chronic",
    "hypothyroidism": "chronic",
    "hyperthyroidism": "chronic",
    "psoriasis": "chronic",
    "tuberculosis": "chronic",
    "hepatitis b": "chronic",
    "hepatitis c": "chronic",
    "hepatitis d": "chronic",
    "hepatitis e": "chronic",
    "hepatitis a": "acute",
    "chronic cholestasis": "chronic",
    "alcoholic hepatitis": "chronic",
    "arthritis": "chronic",
    "osteoarthristis": "chronic",
    "cervical spondylosis": "chronic",
    "varicose veins": "chronic",
    "paralysis (brain hemorrhage)": "chronic",
    "(vertigo) paroymsal  positional vertigo": "chronic",
    "bronchial asthma": "chronic",
    "hypoglycemia": "chronic",

    # Acute
    "common cold": "acute",
    "pneumonia": "acute",
    "dengue": "acute",
    "malaria": "acute",
    "typhoid": "acute",
    "chicken pox": "acute",
    "fungal infection": "acute",
    "impetigo": "acute",
    "acne": "acute",
    "allergy": "acute",
    "drug reaction": "acute",
    "gastroesophageal reflux disease": "acute",
    "gerd": "acute",
    "peptic ulcer disease": "acute",
    "peptic ulcer diseae": "acute",
    "urinary tract infection": "acute",
    "dimorphic hemorrhoids": "acute",
    "dimorphic hemmorhoids(piles)": "acute",
    "jaundice": "acute",
    "migraine": "acute",
    "gastroenteritis": "acute",
    "heart attack": "acute" 
}

def clean_feature_name(name):
    """
    Clean CSV column names to match frontend snake_case generation.
    - Removes parens
    - Replaces double underscores with single
    - Strips whitespace
    """
    name = name.lower().strip()
    name = name.replace("(", "").replace(")", "")
    name = name.replace("__", "_")
    name = re.sub(r'\s+', '_', name)
    return name

def train():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

    print("Loading dataset...")
    df = pd.read_csv(DATA_PATH)

    # 1. Clean feature names (columns)
    # Exclude the last column 'disease' from cleaning or handle separately
    cols = list(df.columns)
    target_col = "disease"
    
    new_cols = []
    for c in cols:
        if c == target_col:
            new_cols.append(c)
        else:
            new_cols.append(clean_feature_name(c))
    
    df.columns = new_cols

    # 2. Normalize disease names
    df["disease_norm"] = df["disease"].astype(str).str.strip().str.lower()
    df["disease_type"] = df["disease_norm"].map(DISEASE_TYPE_RAW)

    # Check for unlabeled
    if df["disease_type"].isna().any():
        missing = df.loc[df["disease_type"].isna(), "disease_norm"].unique()
        print(f"Warning: Unlabeled diseases found: {missing}")
        # Drop them for training safety
        df = df.dropna(subset=["disease_type"])

    # 3. Split Data
    acute_df = df[df["disease_type"] == "acute"].copy()
    chronic_df = df[df["disease_type"] == "chronic"].copy()

    print(f"Acute samples: {len(acute_df)}, Chronic samples: {len(chronic_df)}")

    # 4. Train Models
    def prepare_and_train(sub_df, name):
        X = sub_df.drop(columns=[target_col, "disease_type", "disease_norm"])
        y = sub_df[target_col]
        
        # Simple cleanup
        X = X.apply(pd.to_numeric, errors="coerce").fillna(0)

        # Feature Selection
        mi = mutual_info_classif(X, y, discrete_features=True)
        mi_series = pd.Series(mi, index=X.columns)
        top_features = mi_series.sort_values(ascending=False).head(40).index.tolist()
        
        print(f"Top 5 features for {name}: {top_features[:5]}")

        X_sel = X[top_features]
        
        # Split
        if y.value_counts().min() < 2:
            X_train, X_test, y_train, y_test = train_test_split(X_sel, y, test_size=0.3, random_state=RANDOM_STATE)
        else:
            X_train, X_test, y_train, y_test = train_test_split(X_sel, y, test_size=0.3, stratify=y, random_state=RANDOM_STATE)

        # Pipeline
        model = Pipeline([
            ("scaler", StandardScaler()),
            ("lr", LogisticRegression(max_iter=5000, class_weight="balanced"))
        ])
        
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        
        print(f"[{name}] Accuracy: {accuracy_score(y_test, preds):.3f}")
        return model, top_features

    print("\nTraining Acute Model...")
    acute_model, acute_features = prepare_and_train(acute_df, "Acute")

    print("\nTraining Chronic Model...")
    chronic_model, chronic_features = prepare_and_train(chronic_df, "Chronic")

    # 5. Save
    os.makedirs(BASE_DIR, exist_ok=True)
    joblib.dump(acute_model, os.path.join(BASE_DIR, "acute_model.joblib"))
    joblib.dump(chronic_model, os.path.join(BASE_DIR, "chronic_model.joblib"))
    
    joblib.dump({
        "acute_features": acute_features,
        "chronic_features": chronic_features
    }, os.path.join(BASE_DIR, "feature_metadata.joblib"))

    print("\nModels saved successfully.")

if __name__ == "__main__":
    train()