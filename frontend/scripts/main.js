function goToBodyMap() {
  const age = document.getElementById('age').value;
  if (!age || !appState.gender || !appState.severe) {
    alert('Please complete all fields');
    return;
  }

  appState.age = age;
  goToScreen(2);
}

function goToSymptoms() {
  if (!appState.selectedRegion) return;
  renderSymptoms();
  goToScreen(3);
}

function goToDiagnostics() {
  if (Object.keys(appState.symptomSeverities).length === 0) {
    alert('Add at least one symptom');
    return;
  }

  goToScreen(4);
  callBackendAndRender();
}

function restart() {
  location.reload();
}
