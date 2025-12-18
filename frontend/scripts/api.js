// scripts/api.js

// 1. Helper function to convert text to snake_case
// e.g. "Chest pain" -> "chest_pain"
function toSnakeCase(str) {
    return str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.toLowerCase())
        .join('_');
}

const API_URL = "http://localhost:8000"; // Ensure your backend runs on this port

async function getDiagnosis(appState) {
  // Aggregate symptoms from ALL regions
  const symptoms = {};
  
  // Iterate over all regions in the state to gather all symptoms
  for (const reg in appState.symptomSeverities) {
    const regData = appState.symptomSeverities[reg];
    for (const [name, severity] of Object.entries(regData)) {
      if (severity > 0) {
        // Convert display name to backend feature name
        symptoms[toSnakeCase(name)] = severity;
      }
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

    // CRITICAL FIX: Return the actual predictions!
    return data.predictions;

  } catch (error) {
    console.error("Prediction Error:", error);
    return [{
      diagnosis: "Connection Error",
      severity: "low",
      advice: "Could not connect to the analysis server. Ensure backend is running at " + API_URL
    }];
  }
}