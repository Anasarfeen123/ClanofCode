{
type: uploaded file
fileName: ClanofCode/frontend/scripts/api.js
fullContent:
// scripts/api.js

const API_URL = "http://localhost:8000"; // Ensure your backend runs on this port

async function getDiagnosis(appState) {
  const region = appState.selectedRegion;
  const symptomData = appState.symptomSeverities[region] || {};
  
  // 1. Prepare symptoms object for Backend (convert to snake_case)
  // { "Chest pain": 3 } -> { "chest_pain": 3 }
  const symptoms = {};
  
  // Aggregate symptoms from ALL regions, not just the currently selected one
  // We iterate over the entire symptomSeverities state
  for (const reg in appState.symptomSeverities) {
    const regData = appState.symptomSeverities[reg];
    for (const [name, severity] of Object.entries(regData)) {
      symptoms[toSnakeCase(name)] = severity;
    }
  }

  // 2. Map 'Severe/Sudden' question to Model Type
  // Yes -> Acute model, No -> Chronic model
  const type = appState.severe === "Yes" ? "acute" : "chronic";

  // 3. Call Backend
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        symptoms: symptoms,
        type: type
      })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    // 4. Process Results
    if (!data.predictions || data.predictions.length === 0) {
      return [{
        diagnosis: "No specific diagnosis found",
        severity: "low",
        advice: "Your symptoms do not match our database clearly. Please consult a general physician."
      }];
    }

    return data.predictions.map(p => ({
      diagnosis: p.disease,
      // Heuristic for severity based on model confidence and disease type
      severity: (p.prob > 0.6 || p.model === "acute") ? "high" : "moderate", 
      advice: getAdvice(p.disease),
      score: Math.round(p.prob * 100)
    }));

  } catch (error) {
    console.error("API Error:", error);
    return [{
      diagnosis: "Connection Error",
      severity: "low",
      advice: "Could not connect to the AI server. Is the backend running?"
    }];
  }
}
}function normalizeRegion(region) {
  return region.replace(" (Back)", "");
}
const region = normalizeRegion(appState.selectedRegion);
