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

// --- MISSING FUNCTION ADDED BELOW ---

function renderSymptomChecklist(region) {
  const container = document.getElementById("symptom-container");
  container.innerHTML = ""; // Clear previous

  const title = document.getElementById("region-title");
  if(title) title.innerText = `Rate Your Symptoms (${region})`;

  const symptoms = symptomMap[region] || [];

  symptoms.forEach(symptom => {
    const div = document.createElement("div");
    div.className = "symptom-item";
    
    // Check if we already have a value for this (if user went back and forth)
    const existingVal = appState.symptomSeverities[region]?.[symptom];

    div.innerHTML = `
      <span class="symptom-name">${symptom}</span>
      <div class="severity-options">
        <button class="severity-option ${existingVal===1?'selected':''}" onclick="setSeverity('${symptom}', 1, this)">Mild</button>
        <button class="severity-option ${existingVal===2?'selected':''}" onclick="setSeverity('${symptom}', 2, this)">Mod</button>
        <button class="severity-option ${existingVal===3?'selected':''}" onclick="setSeverity('${symptom}', 3, this)">Sev</button>
        <button class="severity-option ${existingVal===4?'selected':''}" onclick="setSeverity('${symptom}', 4, this)">Bad</button>
      </div>
    `;
    if (existingVal) div.classList.add('has-severity');
    container.appendChild(div);
  });
}