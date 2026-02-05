const values = [0, 0, 0, 0, 0]; // [vert foncé, vert clair, orange, rouge, bleu]
const rows = document.querySelectorAll(".row");
const scoreEl = document.getElementById("score");
const resetBtn = document.getElementById("resetBtn");
const themeBtn = document.getElementById("themeBtn");

// Poids selon la formule Excel fournie
const weights = [1, 2 / 3, 1 / 3, 0, 0];

function updateUI() {
  rows.forEach((row, i) => {
    row.querySelector(".value").textContent = values[i];
  });
  updateScore();
}

function updateScore() {
  // Le bleu (index 4) ne compte pas
  const totalCount = values[0] + values[1] + values[2] + values[3];
  let score = 0;

  if (totalCount > 0) {
    const weighted =
      values[0] * weights[0] +
      values[1] * weights[1] +
      values[2] * weights[2] +
      values[3] * weights[3];

    score = (weighted / totalCount) * 20;
  }

  const formatted = score.toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  scoreEl.textContent = `Note : ${formatted} / 20`;
}

rows.forEach((row, i) => {
  row.querySelector(".plus").addEventListener("click", () => {
    values[i]++;
    updateUI();
  });

  row.querySelector(".minus").addEventListener("click", () => {
    values[i] = Math.max(0, values[i] - 1);
    updateUI();
  });
});

resetBtn.addEventListener("click", () => {
  for (let i = 0; i < values.length; i++) values[i] = 0;
  updateUI();
});

// Thème clair/sombre mémorisé
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});

updateUI();
