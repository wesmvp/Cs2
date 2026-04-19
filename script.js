const form = document.getElementById("form");
const results = document.getElementById("results");
const empty = document.getElementById("empty");

const scoreEl = document.getElementById("score");
const labelEl = document.getElementById("label");
const problemsEl = document.getElementById("problems");
const fixesEl = document.getElementById("fixes");
const preview = document.getElementById("preview");

const saveBtn = document.getElementById("save");
const undoBtn = document.getElementById("undo");
const clearBtn = document.getElementById("clear");
const snapshotsEl = document.getElementById("snapshots");

const nameInput = document.getElementById("name");
const styleInput = document.getElementById("style");
const imgInput = document.getElementById("img");

let currentAnalysis = null;
let snapshots = JSON.parse(localStorage.getItem("uglyCitySnapshots")) || [];

renderSnapshots();

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const cityName = nameInput.value.trim() || "Unnamed City";
  const style = styleInput.value;
  const selectedIssues = Array.from(
    document.querySelectorAll('.checkbox-grid input[type="checkbox"]:checked')
  ).map((box) => box.value);

  let score = 100;
  const problems = [];
  const fixes = [];

  if (selectedIssues.includes("gridy")) {
    score -= 18;
    problems.push("Your layout feels too repetitive and boxy.");
    fixes.push("Break up large grids with curves, diagonals, and offset neighborhoods.");
  }

  if (selectedIssues.includes("downtown")) {
    score -= 16;
    problems.push("Your downtown does not stand out enough.");
    fixes.push("Create a stronger center with taller buildings, main roads, and landmarks.");
  }

  if (selectedIssues.includes("water")) {
    score -= 14;
    problems.push("Your waterfront is not helping the city's look.");
    fixes.push("Use parks, paths, leisure, and cleaner road placement along the water.");
  }

  if (selectedIssues.includes("same")) {
    score -= 14;
    problems.push("Too much of the city looks the same.");
    fixes.push("Give districts different shapes, densities, and road styles.");
  }

  if (selectedIssues.includes("focal")) {
    score -= 12;
    problems.push("The city has no clear focal point.");
    fixes.push("Build one skyline cluster, landmark area, or main boulevard to anchor the city.");
  }

  if (selectedIssues.includes("terrain")) {
    score -= 16;
    problems.push("Your roads feel disconnected from the terrain.");
    fixes.push("Let hills, rivers, and coastlines shape the layout instead of forcing straight lines.");
  }

  if (selectedIssues.length === 0) {
    problems.push("No major visual problems were selected.");
    fixes.push("Try comparing district variety, skyline shape, and terrain usage for finer improvements.");
  }

  if (score < 0) score = 0;

  let styleTip = "";
  if (style === "realistic") {
    styleTip = "For a realistic city, mix road angles, respect terrain, and avoid perfect repetition.";
  } else if (style === "american") {
    styleTip = "For an American feel, use some grids, but break them with highways, suburbs, and commercial corridors.";
  } else if (style === "european") {
    styleTip = "For a European feel, use irregular streets, tighter blocks, and stronger mixed-use cores.";
  } else if (style === "suburban") {
    styleTip = "For suburbs, use curves, cul-de-sacs, spacing, and quieter transitions between neighborhoods.";
  } else if (style === "dense") {
    styleTip = "For a dense city, focus on skyline layering, strong downtown edges, and transit-centered development.";
  }

  if (styleTip) fixes.unshift(styleTip);

  let label = "";
  if (score >= 85) {
    label = "Beautiful";
  } else if (score >= 70) {
    label = "Pretty Good";
  } else if (score >= 50) {
    label = "Needs Work";
  } else {
    label = "Ugly 😭";
  }

  scoreEl.textContent = score + "/100";
  labelEl.textContent = `${label} — ${cityName}`;

  problemsEl.innerHTML = problems.map(item => `<li>${item}</li>`).join("");
  fixesEl.innerHTML = fixes.map(item => `<li>${item}</li>`).join("");

  results.classList.remove("hidden");
  empty.classList.add("hidden");

  const file = imgInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      preview.src = reader.result;
      preview.classList.remove("hidden");

      currentAnalysis = {
        cityName,
        style,
        score,
        label,
        problems,
        fixes,
        image: reader.result,
        createdAt: new Date().toLocaleString()
      };
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
    preview.classList.add("hidden");

    currentAnalysis = {
      cityName,
      style,
      score,
      label,
      problems,
      fixes,
      image: "",
      createdAt: new Date().toLocaleString()
    };
  }
});

saveBtn.addEventListener("click", function () {
  if (!currentAnalysis) return;

  snapshots.unshift(currentAnalysis);
  localStorage.setItem("uglyCitySnapshots", JSON.stringify(snapshots));
  renderSnapshots();
});

undoBtn.addEventListener("click", function () {
  if (snapshots.length === 0) return;

  snapshots.shift();
  localStorage.setItem("uglyCitySnapshots", JSON.stringify(snapshots));
  renderSnapshots();
});

clearBtn.addEventListener("click", function () {
  snapshots = [];
  localStorage.setItem("uglyCitySnapshots", JSON.stringify(snapshots));
  renderSnapshots();
});

function deleteSnapshot(index) {
  snapshots.splice(index, 1);
  localStorage.setItem("uglyCitySnapshots", JSON.stringify(snapshots));
  renderSnapshots();
}

function renderSnapshots() {
  if (snapshots.length === 0) {
    snapshotsEl.innerHTML = "<p>No snapshots saved yet.</p>";
    return;
  }

  snapshotsEl.innerHTML = snapshots
    .map((snap, index) => {
      return `
        <div class="snapshot">
          <h3>${snap.cityName}</h3>
          <p><strong>Score:</strong> ${snap.score}/100</p>
          <p><strong>Rating:</strong> ${snap.label}</p>
          <p><strong>Saved:</strong> ${snap.createdAt}</p>

          <div style="margin-top:8px;">
            <strong>Problems</strong>
            <ul>
              ${snap.problems.map(item => `<li>${item}</li>`).join("")}
            </ul>
          </div>

          <div style="margin-top:8px;">
            <strong>Fixes</strong>
            <ul>
              ${snap.fixes.map(item => `<li>${item}</li>`).join("")}
            </ul>
          </div>

          ${snap.image ? `<img src="${snap.image}" alt="Snapshot image">` : ""}

          <button class="ghost" style="margin-top:10px;" onclick="deleteSnapshot(${index})">
            Delete
          </button>
        </div>
      `;
    })
    .join("");
}

window.deleteSnapshot = deleteSnapshot;
