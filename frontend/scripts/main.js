function saveSymptoms() {
  document.getElementById("sum-age").textContent = appState.age;
  document.getElementById("sum-gender").textContent = appState.gender;
  document.getElementById("sum-severe").textContent = appState.severe;
  document.getElementById("sum-region").textContent = appState.selectedRegion;

  const symptoms =
    appState.symptomSeverities[appState.selectedRegion] || {};

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
