// Deux jeux de compteurs indépendants
const noteValues = [0, 0, 0, 0, 0];   // [vert foncé, vert clair, orange, rouge, bleu]
const colorValues = [0, 0, 0, 0, 0];  // idem

const rowsNote = document.querySelectorAll("#rowsNote .row");
const rowsColor = document.querySelectorAll("#rowsColor .row");

const scoreEl = document.getElementById("score");
const colorResultEl = document.getElementById("colorResult");

const resetNoteBtn = document.getElementById("resetNoteBtn");
const resetColorBtn = document.getElementById("resetColorBtn");

const themeBtn = document.getElementById("themeBtn");
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

// ====== Onglets ======
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    panels.forEach(p => p.classList.remove("active"));

    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// ====== Note /20 ======
const noteWeights = [1, 2 / 3, 1 / 3, 0, 0];

function updateNoteUI() {
  rowsNote.forEach((row, i) => {
    row.querySelector(".value").textContent = noteValues[i];
  });

  const total = noteValues[0] + noteValues[1] + noteValues[2] + noteValues[3]; // sans bleu
  let score = 0;

  if (total > 0) {
    const weighted =
      noteValues[0] * noteWeights[0] +
      noteValues[1] * noteWeights[1] +
      noteValues[2] * noteWeights[2] +
      noteValues[3] * noteWeights[3];

    score = (weighted / total) * 20;
  }

  const formatted = score.toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  scoreEl.textContent = `Note : ${formatted} / 20`;
}

rowsNote.forEach((row, i) => {
  row.querySelector(".plus").addEventListener("click", () => {
    noteValues[i]++;
    updateNoteUI();
  });

  row.querySelector(".minus").addEventListener("click", () => {
    noteValues[i] = Math.max(0, noteValues[i] - 1);
    updateNoteUI();
  });
});

resetNoteBtn.addEventListener("click", () => {
  for (let i = 0; i < noteValues.length; i++) noteValues[i] = 0;
  updateNoteUI();
});

// ====== Couleur de sortie ======
// Échelle : rouge=0, orange=1, vert clair=2, vert foncé=3
// bleu ignoré
function updateColorUI() {
  rowsColor.forEach((row, i) => {
    row.querySelector(".value").textContent = colorValues[i];
  });

  const dgreen = colorValues[0];
  const lgreen = colorValues[1];
  const orange = colorValues[2];
  const red = colorValues[3];
  const total = dgreen + lgreen + orange + red;

  colorResultEl.className = "color-result";

  if (total === 0) {
    colorResultEl.classList.add("neutral");
    colorResultEl.textContent = "Couleur : —";
    return;
  }

  const mean =
    (red * 0 + orange * 1 + lgreen * 2 + dgreen * 3) / total;

  let label = "";
  let cls = "";

  if (mean < 0.5) {
    label = "Rouge";
    cls = "red";
  } else if (mean < 1.5) {
    label = "Orange";
    cls = "orange";
  } else if (mean < 2.5) {
    label = "Vert clair";
    cls = "lgreen";
  } else {
    label = "Vert foncé";
    cls = "dgreen";
  }

  colorResultEl.classList.add(cls);
  colorResultEl.textContent = `Couleur : ${label}`;
}

rowsColor.forEach((row, i) => {
  row.querySelector(".plus").addEventListener("click", () => {
    colorValues[i]++;
    updateColorUI();
  });

  row.querySelector(".minus").addEventListener("click", () => {
    colorValues[i] = Math.max(0, colorValues[i] - 1);
    updateColorUI();
  });
});

resetColorBtn.addEventListener("click", () => {
  for (let i = 0; i < colorValues.length; i++) colorValues[i] = 0;
  updateColorUI();
});

// ====== Thème ======
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") document.body.classList.add("dark");

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});

// Init
updateNoteUI();
updateColorUI();
