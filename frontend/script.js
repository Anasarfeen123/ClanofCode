// 🔴 PROOF SCRIPT IS LOADED

// STEP LOGIC
let currentStep = 1;

function showStep(step) {
  // hide all steps
  const steps = document.querySelectorAll(".step");
  steps.forEach(s => s.style.display = "none");

  // show current step
  const active = document.getElementById(`step-${step}`);
  if (active) active.style.display = "block";

  currentStep = step;
}

function nextStep() {
  showStep(currentStep + 1);
}

function prevStep() {
  showStep(currentStep - 1);
}

function resetSteps() {
  showStep(1);
}

// initial state
window.onload = () => {
  showStep(1);
};
