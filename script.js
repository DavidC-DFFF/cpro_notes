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

  updateScore();
  updateColorByAxisAverage();
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
}

/**
 * Couleur par position moyenne sur l'axe :
 * R=0, O=1, VC=2, VF=3 (bleu ignoré)
 * - Cas x.5 => arrondi au supérieur
 * - Sinon arrondi au plus proche
 */
function updateColorByAxisAverage() {
  const VF = values[0];
  const VC = values[1];
  const O = values[2];
  const R = values[3];

  const total = VF + VC + O + R;

  colorResultEl.className = "color-result";

  if (total === 0) {
    colorResultEl.classList.add("neutral");
    colorResultEl.textContent = "Couleur : —";
    return;
  }

  // moyenne des niveaux (R=0, O=1, VC=2, VF=3)
  const mean = (3 * VF + 2 * VC + 1 * O + 0 * R) / total;

  // gestion précise du "pile entre 2" => couleur supérieure
  const EPS = 1e-9;
  let level;
  if (Math.abs(mean * 2 - Math.round(mean * 2)) < EPS && Math.round(mean * 2) % 2 === 1) {
    // mean est de la forme n + 0.5
    level = Math.ceil(mean);
  } else {
    level = Math.round(mean);
  }

  // sécurité bornes
  level = Math.max(0, Math.min(3, level));

  if (level === 0) {
    colorResultEl.classList.add("red");
    colorResultEl.textContent = "Couleur : Rouge";
  } else if (level === 1) {
    colorResultEl.classList.add("orange");
    colorResultEl.textContent = "Couleur : Orange";
  } else if (level === 2) {
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
