// scripts/ui.js

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

// --- MISSING FUNCTIONS ADDED BELOW ---

function goToBodyMap() {
  const age = document.getElementById("age").value;
  if (!age || !appState.gender || !appState.severe) {
    alert("Please enter your age, sex, and severity to continue.");
    return;
  }
  appState.age = age;
  goToScreen(2);
}

function selectRegion(region, el) {
  appState.selectedRegion = region;
  
  // Update visual selection
  document.querySelectorAll('.region').forEach(r => r.classList.remove('selected'));
  if (el.classList.contains('region')) {
    el.classList.add('selected');
  } else {
    el.closest('.region').classList.add('selected');
  }

  document.getElementById('selected-region').textContent = "Selected: " + region;
  document.getElementById('body-continue-btn').disabled = false;
}

function goToSymptoms() {
  // Render the specific symptoms for the chosen body part
  renderSymptomChecklist(appState.selectedRegion);
  goToScreen(3);
}
function toggleButtonGroup(parent, clickedBtn) {
  [...parent.children].forEach(btn => btn.classList.remove("active"));
  clickedBtn.classList.add("active");
}
