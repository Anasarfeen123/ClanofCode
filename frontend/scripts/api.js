// scripts/api.js

function getDiagnosis(appState) {
  const region = appState.selectedRegion;
  const symptomData = appState.symptomSeverities[region] || {};
  const selectedSymptoms = Object.keys(symptomData);

  let results = [];

  DIAGNOSIS_RULES.forEach(rule => {
    if (rule.region !== region) return;

    const matches = rule.symptoms.filter(s =>
      selectedSymptoms.includes(s)
    );

    if (matches.length > 0) {
      results.push({
        diagnosis: rule.diagnosis,
        severity: rule.severity,
        advice: rule.advice,
        score: matches.length
      });
    }
  });

  if (results.length === 0) {
    results.push({
      diagnosis: "Non-specific discomfort",
      severity: "low",
      advice: "Monitor symptoms and consult a doctor if persistent",
      score: 1
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}
