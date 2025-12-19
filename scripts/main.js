// scripts/main.js

document.addEventListener("DOMContentLoaded", () => {
    console.log("App Initialized");
});

// 1. Helper: Get Icon based on condition name
function getIconForCondition(name) {
    const n = name.toLowerCase();
    if (n.includes("heart") || n.includes("cardio")) return "❤️";
    if (n.includes("stomach") || n.includes("abdominal") || n.includes("digest") || n.includes("ulcer")) return "🤢";
    if (n.includes("head") || n.includes("migraine")) return "🧠";
    if (n.includes("lung") || n.includes("breath") || n.includes("cough")) return "🫁";
    if (n.includes("skin") || n.includes("rash") || n.includes("allergy")) return "🤒";
    if (n.includes("joint") || n.includes("knee") || n.includes("arthr")) return "🦴";
    if (n.includes("infection") || n.includes("viral") || n.includes("urinary")) return "🦠";
    return "🩺"; // Default Stethoscope
}

// 2. Main Function: Display Results Cards
function displayResults(predictions) {
    const container = document.getElementById("results-container");
    container.innerHTML = ""; // Clear previous results

    if (!predictions || predictions.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px; color:#64748b;">
                <h3>No clear match found</h3>
                <p>Try adding more symptoms or selecting different regions.</p>
            </div>`;
        return;
    }

    // Sort by confidence (highest first) just in case
    predictions.sort((a, b) => b.confidence - a.confidence);

    // Limit to top 5 results
    predictions.slice(0, 5).forEach((pred, index) => {
        // Handle Confidence: Backend might send 0.14 or 14.0
        // We normalize it to a 0-100 scale for display
        let rawScore = pred.confidence;
        if (rawScore <= 1) rawScore = rawScore * 100;
        const percentage = rawScore.toFixed(1);
        
        // Determine Acute/Chronic Badge
        const typeClass = appState.severe === "Yes" ? "type-acute" : "type-chronic";
        const typeLabel = appState.severe === "Yes" ? "Acute" : "Chronic";

        const icon = getIconForCondition(pred.condition);

        const card = document.createElement("div");
        card.className = "result-card";
        
        // Animation: Staggered fade in
        card.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;
        card.style.opacity = "0"; 

        card.innerHTML = `
            <div class="result-header">
                <div class="result-icon-box">${icon}</div>
                <div class="result-title-group">
                    <div class="result-title">${pred.condition}</div>
                    <div class="result-category">
                        <span class="type-badge ${typeClass}">${typeLabel} condition</span>
                    </div>
                </div>
            </div>

            <div class="confidence-section">
                <div class="confidence-header">
                    <span>Match Confidence</span>
                    <span style="color:var(--text-main)">${percentage}%</span>
                </div>
                <div class="confidence-bar-bg">
                    <div class="confidence-bar-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// 3. Update Summary Header (With Icons)
function updateSummaryDisplay() {
    // Icons (Using SVGs for cleaner look)
    const icons = {
        age: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>',
        sex: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>',
        duration: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        regions: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 18l-2 -1l-6 3v-13l6 -3l6 3l6 -3v7.5" /><path d="M9 4v13" /><path d="M15 7v5" /><circle cx="16.5" cy="17.5" r="2.5" /><path d="M18.5 19.5l2.5 2.5" /></svg>'
    };

    const count = Object.keys(appState.symptomSeverities).length;
    
    // Inject HTML into summary items
    const elAge = document.getElementById('sum-age');
    if(elAge) {
        elAge.parentElement.innerHTML = `
            <div class="summary-item">
                <div class="summary-icon">${icons.age}</div>
                <div class="summary-text">
                    <strong>${appState.age} Years</strong>
                    <span>Age</span>
                </div>
            </div>`;
    }

    const elGender = document.getElementById('sum-gender');
    if(elGender) {
        elGender.parentElement.innerHTML = `
            <div class="summary-item">
                <div class="summary-icon">${icons.sex}</div>
                <div class="summary-text">
                    <strong>${appState.gender}</strong>
                    <span>Sex</span>
                </div>
            </div>`;
    }

    const elSevere = document.getElementById('sum-severe');
    if(elSevere) {
        elSevere.parentElement.innerHTML = `
            <div class="summary-item">
                <div class="summary-icon">${icons.duration}</div>
                <div class="summary-text">
                    <strong>${appState.severe === 'Yes' ? '> 10 Days' : '< 10 Days'}</strong>
                    <span>Duration</span>
                </div>
            </div>`;
    }

    const elCount = document.getElementById('sum-regions-count');
    if(elCount) {
        elCount.parentElement.innerHTML = `
            <div class="summary-item">
                <div class="summary-icon">${icons.regions}</div>
                <div class="summary-text">
                    <strong>${count} Areas</strong>
                    <span>Affected Regions</span>
                </div>
            </div>`;
    }
}