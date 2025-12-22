import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.feature_selection import mutual_info_classif
from sklearn.metrics import accuracy_score, f1_score
from sklearn.naive_bayes import BernoulliNB

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
    "peptic ulcer diseae": "acute",  # typo handled
    "urinary tract infection": "acute",
    "dimorphic hemorrhoids": "acute",
    "dimorphic hemmorhoids(piles)": "acute",
    "jaundice": "acute",
    "migraine": "acute",
    "gastroenteritis": "acute"
}


# =====================================================
# 1. Load dataset
# =====================================================
DATA_PATH = "symp_data.csv"
df = pd.read_csv(DATA_PATH)

# =====================================================
# Normalize disease names (IMPORTANT)
# =====================================================
df["disease_norm"] = (
    df["disease"]
    .astype(str)
    .str.strip()
    .str.lower()
)

df["disease_type"] = df["disease_norm"].map(DISEASE_TYPE_RAW)

# Sanity check
if df["disease_type"].isna().any():
    missing = df.loc[df["disease_type"].isna(), "disease"].unique()
    raise ValueError(f"Unlabeled diseases found: {missing}")


print(df["disease_type"].value_counts())

# =====================================================
# 2. Separate features and target
# =====================================================
acute_df = df[df["disease_type"] == "acute"].copy()
chronic_df = df[df["disease_type"] == "chronic"].copy()

print("Acute samples:", acute_df.shape)
print("Chronic samples:", chronic_df.shape)

def normalize_disease(name):
    return (
        name.strip()              # remove leading/trailing spaces
            .lower()              # lowercase
    )

df["disease_norm"] = df["disease"].apply(normalize_disease)


def prepare_data(df, target_col="disease", top_k=40):
    X = df.drop(columns=[target_col, "disease_type"])
    y = df[target_col]

    X = X.apply(pd.to_numeric, errors="coerce").fillna(0)

    mi = mutual_info_classif(X, y, discrete_features=False)
    mi_series = pd.Series(mi, index=X.columns)

    top_features = (
        mi_series.sort_values(ascending=False)
        .head(top_k)
        .index
        .tolist()
    )

    return X[top_features], y, top_features
def train_model(X, y):
    if y.value_counts().min() < 2:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.3, random_state=42
        )
    else:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.3, stratify=y, random_state=42
        )


    model = Pipeline([
        ("scaler", StandardScaler()),
        ("lr", LogisticRegression(
            max_iter=5000,
            class_weight="balanced"
        ))
    ])

    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    print("Accuracy:", accuracy_score(y_test, preds))
    print("Macro F1:", f1_score(y_test, preds, average="macro"))

    return model
X_acute, y_acute, acute_features = prepare_data(acute_df)
acute_model = train_model(X_acute, y_acute)
X_chronic, y_chronic, chronic_features = prepare_data(chronic_df)
chronic_model = train_model(X_chronic, y_chronic)
joblib.dump(acute_model, "model/acute_model.joblib")
joblib.dump(chronic_model, "model/chronic_model.joblib")

joblib.dump({
    "acute_features": acute_features,
    "chronic_features": chronic_features
}, "model/feature_metadata.joblib")

print("Acute & Chronic models saved successfully")
