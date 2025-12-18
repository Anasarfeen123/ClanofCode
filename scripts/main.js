// scripts/main.js

document.addEventListener("DOMContentLoaded", () => {
    console.log("App Initialized");
});

// Helper function to display results in Screen 4
function displayResults(predictions) {
    const resultsContainer = document.getElementById("results-container");
    if (!resultsContainer) return;

    resultsContainer.innerHTML = ""; 
    
    if (!predictions || predictions.length === 0) {
        resultsContainer.innerHTML = `
            <div class="diagnostic-card low">
                <h4>No clear diagnosis</h4>
                <p>We couldn't match your symptoms to a specific condition with high confidence.</p>
            </div>`;
        return;
    }

    predictions.forEach(p => {
        // Handle probability (0-1 range vs 0-100 range)
        let prob = p.prob;
        if(prob <= 1) prob = prob * 100;

        const confidence = prob.toFixed(1);
        
        let severityClass = "low";
        if (prob > 70) severityClass = "strong";
        else if (prob > 40) severityClass = "moderate";

        const card = document.createElement("div");
        card.className = `diagnostic-card ${severityClass}`;
        
        card.innerHTML = `
            <h4>${p.disease}</h4>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span>Confidence: <strong>${confidence}%</strong></span>
                <span style="color:#666; font-size:0.9em;">${p.model || 'General'}</span>
            </div>
            ${p.precautions ? `<p style="margin-top:8px; font-size:0.95em;"><strong>Rx:</strong> ${p.precautions}</p>` : ''}
        `;
        
        resultsContainer.appendChild(card);
    });
}