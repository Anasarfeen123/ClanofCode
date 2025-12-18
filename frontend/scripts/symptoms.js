function normalizeSymptom(symptom) {
  return symptom.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');
}

function getRegionSymptoms(region) {
  if (!appState.symptomSeverities[region]) {
    appState.symptomSeverities[region] = {};
  }
  return appState.symptomSeverities[region];
}

function selectRegion(region, el) {
  appState.selectedRegion = region;

  document.querySelectorAll('.region').forEach(r =>
    r.classList.remove('selected')
  );

  el.classList.add('selected');

  document.getElementById('selected-region').textContent =
    'Selected: ' + region;

  document.getElementById('body-continue-btn').disabled = false;
}

function renderSymptoms() {
  const container = document.getElementById('symptom-container');
  container.innerHTML = '';

  const region = appState.selectedRegion;
  const symptoms = symptomMap[region] || [];
  const saved = getRegionSymptoms(region);
  const labels = ['None', 'Low', 'Moderate', 'High', 'Unbearable'];

  symptoms.forEach(symptom => {
    const div = document.createElement('div');
    div.className = 'symptom-item';

    const title = document.createElement('div');
    title.className = 'symptom-name';
    title.textContent = symptom;

    const scale = document.createElement('div');
    scale.className = 'severity-scale';

    labels.forEach((label, level) => {
      const opt = document.createElement('div');
      opt.className = 'severity-option';
      opt.onclick = () => selectSeverity(symptom, level, div);

      if (saved[symptom] === level) {
        opt.classList.add('selected');
        div.classList.add('has-severity');
      }

      opt.innerHTML = `<span class="severity-label">${label}</span>`;
      scale.appendChild(opt);
    });

    div.appendChild(title);
    div.appendChild(scale);
    container.appendChild(div);
  });
}

function selectSeverity(symptom, level, itemDiv) {
  const regionSymptoms = getRegionSymptoms(appState.selectedRegion);

  if (level === 0) {
    delete regionSymptoms[symptom];
    itemDiv.classList.remove('has-severity');
  } else {
    regionSymptoms[symptom] = level;
    itemDiv.classList.add('has-severity');
  }
}

function saveSymptoms() {
  goToScreen(2);
}
