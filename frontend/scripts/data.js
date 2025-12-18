{
type: uploaded file
fileName: ClanofCode/frontend/scripts/data.js
fullContent:
// scripts/data.js

const severityLabels = ["None", "Mild", "Moderate", "Severe", "Unbearable"];

// Maps body regions to display names of symptoms.
const symptomMap = {
  "Head": [
    "Headache", "Dizziness", "Nausea", "Loss of balance", 
    "Slurred speech", "Visual disturbances"
  ],
  "Chest": [
    "Chest pain", "Breathlessness", "Cough", "Phlegm", 
    "Fast heart rate", "Congestion"
  ],
  "Abdomen": [
    "Abdominal pain", "Vomiting", "Acidity", "Indigestion", 
    "Stomach pain", "Bloating", "Constipation", "Diarrhoea"
  ],
  "Left Arm": [
    "Joint pain", "Muscle pain", "Weakness in limbs", "Swelling joints"
  ],
  "Right Arm": [
    "Joint pain", "Muscle pain", "Weakness in limbs", "Swelling joints"
  ],
  "Left Leg": [
    "Knee pain", "Swollen legs", "Painful walking", "Prominent veins on calf"
  ],
  "Right Leg": [
    "Knee pain", "Swollen legs", "Painful walking", "Prominent veins on calf"
  ],
  "Upper Back": [
    "Back pain", "Neck pain", "Stiff neck", "Muscle weakness"
  ],
  "Lower Back": [
    "Back pain", "Muscle weakness", "Movement stiffness"
  ],
  // Back mappings
  "Head (Back)": ["Headache", "Stiff neck", "Neck pain"],
  "Left Arm (Back)": ["Muscle pain", "Joint pain"],
  "Right Arm (Back)": ["Muscle pain", "Joint pain"],
  "Left Leg (Back)": ["Calf pain", "Muscle pain"],
  "Right Leg (Back)": ["Calf pain", "Muscle pain"]
};

// Helper to match CSV column names (used by api.js)
function toSnakeCase(str) {
  return str.toLowerCase().replace(/\s+/g, '_');
}

// Fallback advice helper
function getAdvice(disease) {
  const advices = {
    "fungal infection": "Keep area dry, use antifungal cream.",
    "allergy": "Avoid allergens, take antihistamines.",
    "gerd": "Avoid spicy food, eat smaller meals.",
    "heart attack": "EMERGENCY: Call ambulance immediately.",
    "migraine": "Rest in a dark room, take pain relief.",
    "common cold": "Rest, hydration, and over-the-counter medication.",
    "pneumonia": "See a doctor for antibiotics.",
    "diabetes": "Monitor blood sugar and consult an endocrinologist."
  };
  return advices[disease.toLowerCase()] || "Please consult a doctor for a thorough evaluation.";
}
}