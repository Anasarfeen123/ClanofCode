async function callBackendAndRender() {
  const payload = {
    age: Number(appState.age),
    sex: appState.gender.toLowerCase(),
    type: appState.severe === "Yes" ? "acute" : "not_sure",
    region: appState.selectedRegion,
    symptoms: {}
  };

  Object.values(appState.symptomSeverities).forEach(region =>
    Object.entries(region).forEach(([s, v]) =>
      payload.symptoms[normalizeSymptom(s)] = v
    )
  );

  const res = await fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  renderResults(data.predictions || []);
}
