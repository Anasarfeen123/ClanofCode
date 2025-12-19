// scripts/api.js

// 1. Helper function to convert text to snake_case
function toSnakeCase(str) {
    return str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.toLowerCase())
        .join('_');
}

// POINT TO YOUR UVICORN SERVER
const API_URL = "http://127.0.0.1:8000";

async function getDiagnosis(appState) {
  // 1. Aggregate symptoms from ALL regions
  const symptoms = {};
  
  for (const reg in appState.symptomSeverities) {
    const regData = appState.symptomSeverities[reg];
    for (const [name, severity] of Object.entries(regData)) {
      if (severity > 0) {
        // Convert "Chest Pain" -> "chest_pain" for backend
        symptoms[toSnakeCase(name)] = severity;
      }
    }
  }

  // 2. Map 'Severe/Sudden' question to Model Type
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
      // Return a fallback object matching the UI structure
      return [{
        condition: "No clear diagnosis", // Matches 'pred.condition' in main.js
        confidence: 0,                   // Matches 'pred.confidence' in main.js
        advice: "Your symptoms do not match our database clearly. Please consult a general physician."
      }];
    }

    return data.predictions;

  } catch (error) {
    console.error("Prediction Error:", error);
    // Return an error object matching the UI structure
    return [{
      condition: "Connection Error",  // Matches 'pred.condition' in main.js
      confidence: 0,                  // Matches 'pred.confidence' in main.js
      advice: `Could not connect to the analysis server. Ensure backend is running at ${API_URL}`
    }];
  }
}