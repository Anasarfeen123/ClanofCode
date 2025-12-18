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
