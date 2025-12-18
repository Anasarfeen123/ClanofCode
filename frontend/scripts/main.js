// frontend/scripts/main.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize State (assuming you have a state.js or similar)
    // If state is not global, ensure it is accessible here.
    console.log("App Initialized");

    // 2. Attach Event Listener to the new Button
    const diagnoseBtn = document.getElementById("diagnose-btn");
    
    if (diagnoseBtn) {
        diagnoseBtn.addEventListener("click", async () => {
            console.log("Diagnosis requested...");
            
            // Show loading state
            diagnoseBtn.textContent = "Analyzing...";
            diagnoseBtn.disabled = true;

            try {
                // Call the API function from api.js
                // Ensure 'appState' is the global state object from state.js
                const predictions = await getDiagnosis(appState);
                
                // Render results
                displayResults(predictions);
                
            } catch (err) {
                console.error(err);
                alert("Failed to get diagnosis.");
            } finally {
                // Reset button
                diagnoseBtn.textContent = "Get Diagnosis";
                diagnoseBtn.disabled = false;
            }
        });
    }
});

// Helper function to display results in the HTML
function displayResults(predictions) {
    const resultsContainer = document.getElementById("results-area");
    if (!resultsContainer) return;

    resultsContainer.innerHTML = "<h3>Diagnosis Results</h3>";
    
    if (predictions.length === 0) {
        resultsContainer.innerHTML += "<p>No clear diagnosis found.</p>";
        return;
    }

    const list = document.createElement("ul");
    predictions.forEach(p => {
        const item = document.createElement("li");
        // Convert probability to percentage
        const confidence = (p.prob * 100).toFixed(1);
        item.innerHTML = `<strong>${p.disease}</strong> (${confidence}%) <br> <small>Type: ${p.model}</small>`;
        list.appendChild(item);
    });
    
    resultsContainer.appendChild(list);
}