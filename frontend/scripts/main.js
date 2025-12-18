type: uploaded file
fileName: ClanofCode/frontend/scripts/main.js
fullContent:
function saveSymptoms() {
  const region = appState.selectedRegion;
  const symptoms = appState.symptomSeverities[region] || {};
    document.getElementById("body-continue-btn").disabled = false;

  console.log("DEBUG STATE:", appState); // 👈 keep this once

  document.getElementById("sum-age").textContent = appState.age;
  document.getElementById("sum-gender").textContent = appState.gender;
  document.getElementById("sum-severe").textContent = appState.severe;
  document.getElementById("sum-region").textContent = region;
  document.getElementById("sum-symptoms").textContent =
    Object.keys(symptoms).join(", ") || "None";

  const results = getDiagnosis(appState);
  renderDiagnosis(results);

  goToScreen(4);
}

function renderDiagnosis(results) {
  const container = document.getElementById("results-container");
  container.innerHTML = "";

  results.forEach(r => {
    const card = document.createElement("div");
    card.className = `diagnostic-card ${severityClass(r.severity)}`;

    card.innerHTML = `
      <h3>${r.diagnosis}</h3>
      <p><strong>Severity:</strong> ${r.severity}</p>
      <p><strong>Advice:</strong> ${r.advice}</p>
    `;

    container.appendChild(card);
  });
}

function severityClass(level) {
  if (level === "high") return "strong";
  if (level === "moderate") return "moderate";
  return "low";
}
function goToBodyMap() {
  if (!state.age || !state.gender || state.severe === null) {
    alert("Fill everything first");
    return;
  }
  goToScreen(2);
}

function goToSymptoms() {
  if (!state.region) {
    alert("Select a region first");
    return;
  }

  loadSymptomsForRegion(state.region);
  goToScreen(3);
}
function goToScreen(n) {
  document.querySelectorAll(".screen").forEach(s =>
    s.classList.remove("active")
  );
  document.getElementById(`screen-${n}`).classList.add("active");
}
