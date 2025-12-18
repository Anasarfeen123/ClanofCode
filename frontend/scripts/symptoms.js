// scripts/symptoms.js

function setSeverity(symptom, level, el) {
  const region = appState.selectedRegion;

  if (!appState.symptomSeverities[region]) {
    appState.symptomSeverities[region] = {};
  }

  appState.symptomSeverities[region][symptom] = level;

  const parent = el.closest(".symptom-item");
  parent.classList.add("has-severity");

  parent.querySelectorAll(".severity-option")
    .forEach(b => b.classList.remove("selected"));

  el.classList.add("selected");
}
function renderSymptomChecklist(region) {
  const container = document.getElementById("symptom-container");
  container.innerHTML = ""; // Clear previous
  
  document.getElementById("region-title").innerText = `Rate Your Symptoms (${region})`;

  // Get symptoms for this region from data.js
  const symptomsList = symptomMap[region] || [];

  symptomsList.forEach(symptom => {
    // Create the HTML for one symptom row
    const div = document.createElement("div");
    div.className = "symptom-item";
    
    div.innerHTML = `
      <span class="symptom-name">${symptom}</span>
      <div class="severity-options">
        <button class="severity-option" onclick="setSeverity('${symptom}', 1, this)">Mild</button>
        <button class="severity-option" onclick="setSeverity('${symptom}', 2, this)">Mod</button>
        <button class="severity-option" onclick="setSeverity('${symptom}', 3, this)">Sev</button>
        <button class="severity-option" onclick="setSeverity('${symptom}', 4, this)">Bad</button>
      </div>
    `;
    
    container.appendChild(div);
  });
}
function renderSymptomChecklist(region) {
  const container = document.getElementById("symptom-container");
  container.innerHTML = ""; // Clear previous items
  
  document.getElementById("region-title").innerText = `Rate Your Symptoms (${region})`;

  // Get symptoms for this region from data.js
  const symptomsList = symptomMap[region] || [];

  symptomsList.forEach(symptom => {
    // Create the HTML for one symptom row
    const div = document.createElement("div");
    div.className = "symptom-item";
    
    div.innerHTML = `
      <span class="symptom-name">${symptom}</span>
      <div class="severity-options">
        <button class="severity-option" onclick="setSeverity('${symptom}', 1, this)">Mild</button>
        <button class="severity-option" onclick="setSeverity('${symptom}', 2, this)">Mod</button>
        <button class="severity-option" onclick="setSeverity('${symptom}', 3, this)">Sev</button>
        <button class="severity-option" onclick="setSeverity('${symptom}', 4, this)">Bad</button>
      </div>
    `;
    
    container.appendChild(div);
  });
}