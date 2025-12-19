// scripts/api.js
// scripts/api.js

function toSnakeCase(str) {
    return str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.toLowerCase())
        .join('_');
}

// FIX: Automatically detect if we are Local or on Vercel
const API_URL = (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost")
    ? "http://127.0.0.1:8000"  // Local Python Server
    : "";                      // Vercel (Relative Path)

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
    // FIX: Added /api to the path so it matches both local and Vercel routing
    const response = await fetch(`${API_URL}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms: symptoms, type: type })
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
      advice: `Could not connect. If local, ensure backend is on port 8000. If Vercel, check server logs.`
    }];
  }
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