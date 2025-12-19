// scripts/api.js

function toSnakeCase(str) {
    return str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.toLowerCase())
        .join('_');
}

// FIX: Smart URL Detection
// If running on localhost/127.0.0.1, use Python server port 8000
// If running on Vercel, use "" (relative path) so Vercel handles the routing
const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
const API_URL = isLocal ? "http://127.0.0.1:8000" : ""; 

async function getDiagnosis(appState) {
  const symptoms = {};
  
  for (const reg in appState.symptomSeverities) {
    const regData = appState.symptomSeverities[reg];
    for (const [name, severity] of Object.entries(regData)) {
      if (severity > 0) {
        symptoms[toSnakeCase(name)] = severity;
      }
    }
  }

  const type = appState.severe === "Yes" ? "acute" : "chronic";

  try {
    console.log("Sending request to:", `${API_URL}/api/predict`);
    
    // Note the /api/predict path. This matches the Vercel rewrite rule.
    const response = await fetch(`${API_URL}/api/predict`, {
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

    if (!data.predictions || data.predictions.length === 0) {
      return [{
        condition: "No clear diagnosis",
        confidence: 0,
        advice: "Your symptoms do not match our database clearly."
      }];
    }

    return data.predictions;

  } catch (error) {
    console.error("Prediction Error:", error);
    return [{
      condition: "Connection Error",
      confidence: 0,
      advice: `Could not connect to analysis server. (${error.message})`
    }];
  }
}