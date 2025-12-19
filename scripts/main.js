// scripts/main.js

document.addEventListener("DOMContentLoaded", () => {
    console.log("App Initialized");
});

// 1. Helper: Get Icon based on condition name (Using Boxicons)
function getIconForCondition(name) {
    const n = name.toLowerCase();
    if (n.includes("heart") || n.includes("cardio")) return "<i class='bx bxs-heart'></i>";
    if (n.includes("stomach") || n.includes("abdominal") || n.includes("digest") || n.includes("ulcer")) return "<i class='bx bxs-capsule'></i>";
    if (n.includes("head") || n.includes("migraine")) return "<i class='bx bxs-brain'></i>";
    if (n.includes("lung") || n.includes("breath") || n.includes("cough")) return "<i class='bx bx-wind'></i>";
    if (n.includes("skin") || n.includes("rash") || n.includes("allergy")) return "<i class='bx bxs-band-aid'></i>";
    if (n.includes("joint") || n.includes("knee") || n.includes("arthr")) return "<i class='bx bxs-bone'></i>";
    if (n.includes("infection") || n.includes("viral") || n.includes("urinary")) return "<i class='bx bxs-virus'></i>";
    return "<i class='bx bxs-plus-medical'></i>"; // Default
}

// 2. Main Function: Display Results Cards
function displayResults(predictions) {
    const container = document.getElementById("results-container");
    container.innerHTML = ""; // Clear previous results

    if (!predictions || predictions.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px; color:#64748b;">
                <i class='bx bx-search-alt' style="font-size:48px; margin-bottom:10px;"></i>
                <h3>No clear match found</h3>
                <p>Try adding more symptoms or selecting different regions.</p>
            </div>`;
        return;
    }

    // Sort by confidence (highest first)
    predictions.sort((a, b) => b.confidence - a.confidence);

    // Limit to top 5 results
    predictions.slice(0, 5).forEach((pred, index) => {
        let rawScore = pred.confidence;
        if (rawScore <= 1) rawScore = rawScore * 100;
        const percentage = rawScore.toFixed(1);
        
        const typeClass = appState.severe === "Yes" ? "type-acute" : "type-chronic";
        const typeLabel = appState.severe === "Yes" ? "Acute" : "Chronic";

        const icon = getIconForCondition(pred.condition);

        const card = document.createElement("div");
        card.className = "result-card";
        
        // Animation
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

// 3. Update Summary Header (With Boxicons)
function updateSummaryDisplay() {
    const count = Object.keys(appState.symptomSeverities).length;
    
    // Helper to generate summary item HTML
    const createSummaryItem = (iconClass, value, label) => `
        <div class="summary-item">
            <div class="summary-icon"><i class='bx ${iconClass}'></i></div>
            <div class="summary-text">
                <strong>${value}</strong>
                <span>${label}</span>
            </div>
        </div>`;

    const elAgeBox = document.getElementById('sum-age-box');
    if(elAgeBox) elAgeBox.innerHTML = createSummaryItem('bx-calendar', `${appState.age} Years`, 'Age');

    const elGenderBox = document.getElementById('sum-gender-box');
    if(elGenderBox) elGenderBox.innerHTML = createSummaryItem('bx-male-female', appState.gender, 'Sex');

    const elDurationBox = document.getElementById('sum-duration-box');
    if(elDurationBox) elDurationBox.innerHTML = createSummaryItem('bx-time', appState.severe === 'Yes' ? '> 10 Days' : '< 10 Days', 'Duration');

    const elRegionsBox = document.getElementById('sum-regions-box');
    if(elRegionsBox) elRegionsBox.innerHTML = createSummaryItem('bx-map-pin', `${count} Areas`, 'Affected Regions');
}