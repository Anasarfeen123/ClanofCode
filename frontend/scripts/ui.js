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
