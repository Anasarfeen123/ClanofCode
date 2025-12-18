function goToBodyMap() {
  const age = document.getElementById('age').value;
  if (!age || !appState.gender || !appState.severe) {
    alert('Please complete all fields');
    return;
  }
  appState.age = age;
  goToScreen(2);
}

function selectRegion(region, el) {
  appState.selectedRegion = region;
  document.querySelectorAll('.region').forEach(r => r.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('selected-region').textContent = `✓ Selected: ${region}`;
  document.getElementById('body-continue-btn').disabled = false;
}

function goToSymptoms() {
  renderSymptoms();
  goToScreen(3);
}

function renderSymptoms() {
  const container = document.getElementById('symptom-container');
  container.innerHTML = '';

  const region = appState.selectedRegion;
  const symptoms = symptomMap[region] || [];
  const saved = appState.symptomSeverities[region] || {};

  symptoms.forEach(symptom => {
    const item = document.createElement('div');
    item.className = 'symptom-item';

    const name = document.createElement('div');
    name.className = 'symptom-name';
    name.textContent = symptom;

    const scale = document.createElement('div');
    scale.className = 'severity-scale';

    severityLabels.forEach((label, level) => {
      const opt = document.createElement('div');
      opt.className = 'severity-option';
      opt.innerHTML = `<span class="severity-label">${label}</span>`;

      if (saved[symptom] === level) {
        opt.classList.add('selected');
        item.classList.add('has-severity');
      }

      opt.onclick = () => selectSeverity(symptom, level, item);
      scale.appendChild(opt);
    });

    item.append(name, scale);
    container.appendChild(item);
  });
}

function selectSeverity(symptom, level, item) {
  const region = appState.selectedRegion;
  appState.symptomSeverities[region] ??= {};

  item.querySelectorAll('.severity-option').forEach(o => o.classList.remove('selected'));

  if (level === 0) {
    delete appState.symptomSeverities[region][symptom];
    item.classList.remove('has-severity');
  } else {
    appState.symptomSeverities[region][symptom] = level;
    item.querySelectorAll('.severity-option')[level].classList.add('selected');
    item.classList.add('has-severity');
  }
}

function saveSymptoms() {
  goToScreen(2);
}
