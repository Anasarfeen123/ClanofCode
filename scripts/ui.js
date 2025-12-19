// scripts/ui.js

function goToScreen(n) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`screen-${n}`);
  if(target) target.classList.add('active');
  
  const subtitles = {
    1: "Let's start with some basic questions",
    2: "Select where you feel symptoms",
    3: "Rate your symptoms",
    4: "Your Results"
  };
  
  const sub = document.getElementById('header-subtitle');
  if(sub) sub.textContent = subtitles[n] || "";
  window.scrollTo(0, 0);
}

function selectGender(gender) {
  appState.gender = gender;
  document.querySelectorAll('.gender-buttons button')
    .forEach(b => b.classList.toggle('active', b.textContent === gender));
}

function answerSevere(value) {
  appState.severe = value;
  
  const buttons = document.querySelectorAll('.question-buttons button');
  buttons.forEach(b => b.classList.remove('active'));
  
  buttons.forEach(b => {
    if ((value === 'Yes' && b.textContent.includes('More than')) ||
        (value === 'No' && b.textContent.includes('Less than'))) {
      b.classList.add('active');
    }
  });
}

function goToBodyMap() {
  const age = document.getElementById("age").value;
  if (!age || !appState.gender || !appState.severe) {
    alert("Please enter your age, sex, and duration to continue.");
    return;
  }
  appState.age = age;
  goToScreen(2);
}

function selectRegion(region, el) {
  appState.selectedRegion = region;
  
  document.querySelectorAll('.region').forEach(r => r.classList.remove('selected'));
  document.querySelectorAll('.region-btn').forEach(b => b.classList.remove('selected'));
  
  if (el.classList.contains('region')) {
    el.classList.add('selected');
  } else if (el.classList.contains('region-btn')) {
    el.classList.add('selected');
  } else {
    if(el.closest('.region')) el.closest('.region').classList.add('selected');
    if(el.closest('.region-btn')) el.closest('.region-btn').classList.add('selected');
  }
  
  const disp = document.getElementById('selected-region');
  if(disp) disp.textContent = "Selected: " + region;
  
  const addBtn = document.getElementById('add-symptoms-btn');
  if(addBtn) {
    addBtn.disabled = false;
    addBtn.textContent = `Add Symptoms for ${region} →`;
    addBtn.classList.add('btn-primary'); 
    addBtn.classList.remove('btn-secondary');
  }
}

function goToSymptoms() {
  if(!appState.selectedRegion) return;
  if(typeof renderSymptomChecklist === 'function') {
    renderSymptomChecklist(appState.selectedRegion);
  }
  goToScreen(3);
}

function saveRegionAndReturn() {
  goToScreen(2);
  const addBtn = document.getElementById('add-symptoms-btn');
  if(addBtn) {
    addBtn.classList.remove('btn-primary');
    addBtn.classList.add('btn-secondary');
    addBtn.textContent = "Add/Edit Symptoms for Region";
  }
}

async function triggerDiagnosis() {
  let hasSymptoms = false;
  
  for(let reg in appState.symptomSeverities) {
    for(let sym in appState.symptomSeverities[reg]) {
      if(appState.symptomSeverities[reg][sym] > 0) hasSymptoms = true;
    }
  }
  
  if(!hasSymptoms) {
    alert("Please add at least one symptom before getting a diagnosis.");
    return;
  }
  
  const btn = document.getElementById('diagnose-btn');
  const oldText = btn.textContent;
  btn.textContent = "Analyzing...";
  btn.disabled = true;
  
  try {
    const predictions = await getDiagnosis(appState);
    
    // These functions exist in main.js, which is loaded AFTER ui.js
    if (typeof displayResults === "function") {
        displayResults(predictions);
    }
    if (typeof updateSummaryDisplay === "function") {
        updateSummaryDisplay();
    }
    
    goToScreen(4);
  } catch(e) {
    console.error(e);
    alert("Error fetching diagnosis. Check backend.");
  } finally {
    btn.textContent = oldText;
    btn.disabled = false;
  }
}

function restart() {
  window.location.reload();
}