// scripts/symptoms.js
document.getElementById("symptom-container").innerHTML = "";


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

//   const symptoms = symptomMap[region] || [];
const symptoms = SYMPTOMS_BY_REGION[region];


  symptoms.forEach(symptom => {
    const div = document.createElement("div");
    div.className = "symptom-item";
    
    // Check if we already have a value for this (if user went back and forth)
    const existingVal = appState.symptomSeverities[region]?.[symptom];

    div.innerHTML = `
      <span class="symptom-name">${symptom}</span>
      <div class="severity-options">
        <button class="severity-option ${existingVal===1?'selected':''}" onclick="setSeverity('${symptom}', 1, this)">Mild</button>
        <button class="severity-option ${existingVal===2?'selected':''}" onclick="setSeverity('${symptom}', 2, this)">Moderate</button>
        <button class="severity-option ${existingVal===3?'selected':''}" onclick="setSeverity('${symptom}', 3, this)">Severe</button>
        <button class="severity-option ${existingVal===4?'selected':''}" onclick="setSeverity('${symptom}', 4, this)">Unbearable</button>
      </div>
    `;
    if (existingVal) div.classList.add('has-severity');
    container.appendChild(div);
  });
}function loadSymptomsForRegion(region) {
  const container = document.getElementById("symptom-container");
  container.innerHTML = "";

  const symptoms = SYMPTOMS_BY_REGION[region];

  if (!symptoms) {
    container.innerHTML = "<p>No symptoms found.</p>";
    return;
  }

  symptoms.forEach(symptom => {
    const div = document.createElement("div");
    div.className = "symptom-item";
    div.innerHTML = `<div class="symptom-name">${symptom}</div>`;
    container.appendChild(div);
  });
}
