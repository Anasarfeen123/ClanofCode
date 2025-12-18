// scripts/symptoms.js
const SEVERITY_LEVELS = [
  { label: "None", value: 0 },
  { label: "Mild", value: 1 },
  { label: "Moderate", value: 2 },
  { label: "Severe", value: 3 },
  { label: "Unbearable", value: 4 }
];


function setSeverity(symptom, level, el) {
  const region = appState.selectedRegion;

  if (!appState.symptomSeverities[region]) {
    appState.symptomSeverities[region] = {};
  }

  appState.symptomSeverities[region][symptom] = level;

  // Visual Feedback
  const parent = el.closest(".symptom-item");
  parent.classList.add("has-severity");

  // Remove 'selected' from siblings
  parent.querySelectorAll(".severity-option")
    .forEach(b => b.classList.remove("selected"));

  // Add 'selected' to clicked
  el.classList.add("selected");
}

function renderSymptomChecklist(region) {
  const container = document.getElementById("symptom-container");
  container.innerHTML = "";

  const title = document.getElementById("region-title");
  if (title) title.innerText = `Rate Symptoms (${region})`;

  const symptoms = SYMPTOMS_BY_REGION[region] || [];

  if (symptoms.length === 0) {
    container.innerHTML = "<p>No specific symptoms listed for this region.</p>";
    return;
  }

  symptoms.forEach(symptom => {
    const div = document.createElement("div");
    div.className = "symptom-item";

    const name = document.createElement("span");
    name.className = "symptom-name";
    name.textContent = symptom;

    const scale = document.createElement("div");
    scale.className = "severity-scale";

    const existingVal =
      appState.symptomSeverities[region]?.[symptom] ?? 0;

    SEVERITY_LEVELS.forEach(({ label, value }) => {
      const btn = document.createElement("button");
      btn.className = "severity-option";
      btn.dataset.sev = value;
      btn.textContent = label;

      if (existingVal === value) {
        btn.classList.add("selected");
        div.classList.add("has-severity");
      }

      btn.onclick = () => setSeverity(symptom, value, btn);
      scale.appendChild(btn);
    });

    div.appendChild(name);
    div.appendChild(scale);
    container.appendChild(div);
  });
}
