const values = [0, 0, 0, 0, 0]; // [vert fonce, vert clair, orange, rouge, bleu]
const noteWeights = [1, 2 / 3, 1 / 3, 0, 0];
const proposalColors = [
  { label: "vert fonce", css: "dgreen" },
  { label: "vert clair", css: "lgreen" },
  { label: "orange", css: "orange" },
  { label: "rouge", css: "red" },
];

const rows = document.querySelectorAll("#rows .row");
const scoreEl = document.getElementById("score");
const colorResultEl = document.getElementById("colorResult");
const resetBtn = document.getElementById("resetBtn");
const themeBtn = document.getElementById("themeBtn");
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

const targetNoteInput = document.getElementById("targetNote");
const skillCountInput = document.getElementById("skillCount");
const proposalScoreEl = document.getElementById("proposalScore");
const proposalGapEl = document.getElementById("proposalGap");
const proposalSummaryEl = document.getElementById("proposalSummary");
const proposalListEl = document.getElementById("proposalList");

function syncThemeButton() {
  themeBtn.setAttribute(
    "aria-pressed",
    document.body.classList.contains("dark") ? "true" : "false"
  );
}

function formatOneDecimal(value) {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function updateUI() {
  rows.forEach((row, i) => {
    row.querySelector(".value").textContent = values[i];
  });

  updateScore();
  updateColorByAxisAverage();
}

function updateScore() {
  const total = values[0] + values[1] + values[2] + values[3];
  let score = 0;

  if (total > 0) {
    const weighted =
      values[0] * noteWeights[0] +
      values[1] * noteWeights[1] +
      values[2] * noteWeights[2] +
      values[3] * noteWeights[3];

    score = (weighted / total) * 20;
  }

  scoreEl.textContent = `Note : ${formatOneDecimal(score)} / 20`;
}

function updateColorByAxisAverage() {
  const darkGreen = values[0];
  const lightGreen = values[1];
  const orange = values[2];
  const red = values[3];
  const total = darkGreen + lightGreen + orange + red;

  colorResultEl.className = "color-result";

  if (total === 0) {
    colorResultEl.classList.add("neutral");
    colorResultEl.textContent = "Couleur : -";
    return;
  }

  const mean = (3 * darkGreen + 2 * lightGreen + orange) / total;
  const isHalf = Math.abs(mean * 2 - Math.round(mean * 2)) < 1e-9;
  let level = isHalf && Math.round(mean * 2) % 2 === 1 ? Math.ceil(mean) : Math.round(mean);
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
    colorResultEl.textContent = "Couleur : Vert fonce";
  }
}

function pluralize(label, count) {
  if (count <= 1) {
    return `${count} ${label}`;
  }

  if (label === "rouge") {
    return `${count} rouges`;
  }

  return `${count} ${label}s`;
}

function buildSummary(counts) {
  const parts = [];

  counts.forEach((count, index) => {
    if (count > 0) {
      parts.push(pluralize(proposalColors[index].label, count));
    }
  });

  if (parts.length === 0) {
    return "0 rouge";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return `${parts.slice(0, -1).join(", ")} et ${parts[parts.length - 1]}`;
}

function renderProposalList(counts) {
  const items = [];

  counts.forEach((count, index) => {
    for (let i = 0; i < count; i++) {
      items.push(`<span class="pill ${proposalColors[index].css}">${proposalColors[index].label}</span>`);
    }
  });

  proposalListEl.innerHTML = items.join("");
}

function chooseBetterProposal(candidate, best, targetScore) {
  if (!best) {
    return candidate;
  }

  const candidateDiff = Math.abs(candidate.score - targetScore);
  const bestDiff = Math.abs(best.score - targetScore);

  if (candidateDiff < bestDiff - 1e-9) {
    return candidate;
  }

  if (Math.abs(candidateDiff - bestDiff) > 1e-9) {
    return best;
  }

  const candidateAbove = candidate.score >= targetScore;
  const bestAbove = best.score >= targetScore;

  if (candidateAbove && !bestAbove) {
    return candidate;
  }

  if (candidateAbove === bestAbove) {
    const candidateRed = candidate.counts[3];
    const bestRed = best.counts[3];

    if (candidateRed !== bestRed) {
      return candidateRed < bestRed ? candidate : best;
    }

    const candidateDarkGreen = candidate.counts[0];
    const bestDarkGreen = best.counts[0];

    if (candidateDarkGreen !== bestDarkGreen) {
      return candidateDarkGreen < bestDarkGreen ? candidate : best;
    }

    const candidateLightGreen = candidate.counts[1];
    const bestLightGreen = best.counts[1];

    if (candidateLightGreen !== bestLightGreen) {
      return candidateLightGreen < bestLightGreen ? candidate : best;
    }

    for (let i = 0; i < candidate.counts.length; i++) {
      if (candidate.counts[i] !== best.counts[i]) {
        return candidate.counts[i] > best.counts[i] ? candidate : best;
      }
    }
  }

  return best;
}

function findBestCombination(targetScore, skillCount) {
  let best = null;

  for (let darkGreen = 0; darkGreen <= skillCount; darkGreen++) {
    for (let lightGreen = 0; lightGreen <= skillCount - darkGreen; lightGreen++) {
      for (let orange = 0; orange <= skillCount - darkGreen - lightGreen; orange++) {
        const red = skillCount - darkGreen - lightGreen - orange;
        const weighted = darkGreen + (2 * lightGreen) / 3 + orange / 3;
        const score = (weighted / skillCount) * 20;
        const candidate = {
          counts: [darkGreen, lightGreen, orange, red],
          score,
        };

        best = chooseBetterProposal(candidate, best, targetScore);
      }
    }
  }

  return best;
}

function updateFromNote() {
  const targetScore = Math.max(0, Math.min(20, Number(targetNoteInput.value) || 0));
  const skillCount = Math.max(1, Math.floor(Number(skillCountInput.value) || 1));
  const best = findBestCombination(targetScore, skillCount);
  const diff = best.score - targetScore;
  const diffPrefix = diff > 0 ? "+" : "";

  proposalScoreEl.textContent = `Note proposee : ${formatOneDecimal(best.score)} / 20`;
  proposalGapEl.className = "color-result neutral";
  proposalGapEl.textContent = `Ecart : ${diffPrefix}${formatOneDecimal(diff)}`;
  proposalSummaryEl.textContent = buildSummary(best.counts);
  renderProposalList(best.counts);
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

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tabTarget;

    tabs.forEach((button) => {
      button.classList.toggle("is-active", button === tab);
    });

    panels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.id === target);
    });
  });
});

resetBtn.addEventListener("click", () => {
  for (let i = 0; i < values.length; i++) {
    values[i] = 0;
  }
  updateUI();
});

[targetNoteInput, skillCountInput].forEach((input) => {
  input.addEventListener("input", updateFromNote);
});

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
}
syncThemeButton();

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  syncThemeButton();
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});

updateUI();
updateFromNote();
