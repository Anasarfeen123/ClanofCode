function goToScreen(screenNum) {
  document.querySelectorAll('.screen').forEach(s =>
    s.classList.remove('active')
  );

  document.getElementById(`screen-${screenNum}`).classList.add('active');

  const subtitles = {
    1: "Let's start with some basic questions",
    2: "Select where you feel symptoms",
    3: "Tell us about your symptoms",
    4: "Preliminary diagnostic insights"
  };

  document.getElementById('header-subtitle').textContent =
    subtitles[screenNum];

  window.scrollTo(0, 0);
}

function selectGender(gender) {
  appState.gender = gender;
  document.querySelectorAll('.gender-buttons button').forEach(btn =>
    btn.classList.toggle('active', btn.textContent === gender)
  );
}

function answerSevere(answer) {
  appState.severe = answer;
  document.querySelectorAll('.question-buttons button').forEach(btn =>
    btn.classList.toggle('active', btn.textContent === answer)
  );
}
