const values = [0, 0, 0, 0, 0]; // [vert foncé, vert clair, orange, rouge, bleu]

const rows = document.querySelectorAll("#rows .row");
const scoreEl = document.getElementById("score");
const colorResultEl = document.getElementById("colorResult");
const resetBtn = document.getElementById("resetBtn");
const themeBtn = document.getElementById("themeBtn");

// Note /20 : vert foncé=1, vert clair=2/3, orange=1/3, rouge=0, bleu ignoré
const noteWeights = [1, 2 / 3, 1 / 3, 0, 0];

function updateUI() {
  rows.forEach((row, i) => {
    row.querySelector(".value").textContent = values[i];
  });

  const score = updateScore();
  updateAverageColorFromScore(score);
}

function updateScore() {
  const total = values[0] + values[1] + values[2] + values[3]; // sans bleu
  let score = 0;

  if (total > 0) {
    const weighted =
      values[0] * noteWeights[0] +
      values[1] * noteWeights[1] +
      values[2] * noteWeights[2] +
      values[3] * noteWeights[3];

    score = (weighted / total) * 20;
  }

  const formatted = score.toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  scoreEl.textContent = `Note : ${formatted} / 20`;
  return score;
}

function updateAverageColorFromScore(score) {
  colorResultEl.className = "color-result";

  // Si aucune donnée (hors bleu), affichage neutre
  const total = values[0] + values[1] + values[2] + values[3];
  if (total === 0) {
    colorResultEl.classList.add("neutral");
    colorResultEl.textContent = "Couleur : —";
    return;
  }

  // Couleur basée sur la note /20
  // Rouge: [0,5[, Orange: [5,10[, Vert clair: [10,15[, Vert foncé: [15,20]
  if (score < 5) {
    colorResultEl.classList.add("red");
    colorResultEl.textContent = "Couleur : Rouge";
  } else if (score < 10) {
    colorResultEl.classList.add("orange");
    colorResultEl.textContent = "Couleur : Orange";
  } else if (score < 15) {
    colorResultEl.classList.add("lgreen");
    colorResultEl.textContent = "Couleur : Vert clair";
  } else {
    colorResultEl.classList.add("dgreen");
    colorResultEl.textContent = "Couleur : Vert foncé";
  }
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

// Thème clair/sombre (mémorisé)
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
