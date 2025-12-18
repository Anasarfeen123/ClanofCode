function goToScreen(n) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${n}`).classList.add('active');

  const subtitles = {
    1: "Let's start with some basic questions",
    2: "Select where you feel symptoms",
    3: "Tell us about your symptoms",
    4: "Preliminary diagnostic insights"
  };

  document.getElementById('header-subtitle').textContent = subtitles[n];
  window.scrollTo(0, 0);
}

function selectGender(gender) {
  appState.gender = gender;
  document.querySelectorAll('.gender-buttons button')
    .forEach(b => b.classList.toggle('active', b.textContent === gender));
}

function answerSevere(ans) {
  appState.severe = ans;
  document.querySelectorAll('.question-buttons button')
    .forEach(b => b.classList.toggle('active', b.textContent === ans));
}
// Validates Screen 1 inputs and moves to Screen 2
function goToBodyMap() {
  const age = document.getElementById("age").value;
  
  if (!age || !appState.gender || !appState.severe) {
    alert("Please provide your Age, Sex, and Answer the severity question.");
    return;
  }
  
  appState.age = age;
  goToScreen(2);
}

// Handles selecting a body part on Screen 2
function selectRegion(regionName, el) {
  appState.selectedRegion = regionName;
  
  // Highlight the selected region visually
  document.querySelectorAll('.region').forEach(r => r.classList.remove('selected'));
  // Note: 'el' might be the text span or the div, so we ensure we target the div
  if(el.classList.contains('region')) {
    el.classList.add('selected');
  } else {
    el.parentElement.classList.add('selected');
  }

  // Update text and enable the continue button
  document.getElementById('selected-region').textContent = `Selected: ${regionName}`;
  document.getElementById('body-continue-btn').disabled = false;
}

// Moves to Screen 3 and renders the specific symptoms for that region
function goToSymptoms() {
  if (!appState.selectedRegion) return;
  
  // Call the function to render the checklist (defined in symptoms.js below)
  renderSymptomChecklist(appState.selectedRegion);
  goToScreen(3);
}