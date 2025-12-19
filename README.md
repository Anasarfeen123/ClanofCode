# 🏥 Symptom Checker - AI Health Analysis

An interactive, AI-powered web application that helps users identify potential health conditions based on their symptoms. Users can select symptoms through an intuitive visual body map or list, and the system provides potential diagnoses with confidence scores using machine learning models.

## ✨ Features

* **Interactive Body Map**: Select symptoms visually by clicking on body parts (Front & Back views).
* **AI-Powered Diagnosis**: Uses Scikit-learn machine learning models to predict diseases.
* **Acute vs. Chronic Analysis**: Differentiates between sudden (acute) and long-term (chronic) conditions.
* **Confidence Scores**: Displays the probability match for each potential diagnosis.
* **Responsive Design**: Modern, glass-morphism UI that works on desktop and mobile.
* **Multi-Language Support**: Integrated Google Translate for accessibility.

## 🛠️ Tech Stack

### Frontend
* HTML5, CSS3 (Custom Variables, Flexbox/Grid)
* JavaScript (Vanilla ES6+)
* Boxicons (UI Icons)

### Backend
* Python 3.x
* FastAPI
* Scikit-learn
* Joblib
* Pandas, NumPy

### Deployment
* Vercel (Frontend & Serverless Python Functions)

## 📂 Project Structure

```
ClanofCode/
├── api/
│   ├── model/
│   └── index.py
├── assets/
├── scripts/
│   ├── api.js
│   ├── ui.js
│   ├── symptoms.js
│   ├── state.js
│   └── main.js
├── styles/
├── index.html
├── requirements.txt
└── vercel.json
```

## 🚀 Getting Started

### Prerequisites
* Python 3.9+
* pip
* VS Code (recommended)

### Clone & Setup
```bash
cd ClanofCode
```

### Install Backend Dependencies
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Run Backend
```bash
uvicorn api.index:app --reload
```

Backend runs at http://127.0.0.1:8000

### Run Frontend
Open `index.html` directly or use Live Server.

## 🌐 Deployment (Vercel)

1. Push project to GitHub
2. Import repository in Vercel
3. Deploy

The `vercel.json` file handles routing to `/api/predict`.

## 🧠 Machine Learning Details

Two models are used:
* **Acute Model** – Short-term conditions
* **Chronic Model** – Long-term conditions

Model selection is based on symptom duration.

## ⚠️ Disclaimer

This tool is for educational purposes only and does not provide medical advice.
