const logMoodBtn = document.getElementById("log-mood-btn");
const modal = document.getElementById("mood-modal");
const closeModal = document.getElementById("close-modal");
const saveMood = document.getElementById("save-mood");
const sleepInput = document.getElementById("sleep-hours");

let selectedMood = null;
const moods = [];

document.querySelectorAll(".mood-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedMood = btn.dataset.mood;
    document.querySelectorAll(".mood-btn").forEach(b => b.style.opacity = "0.5");
    btn.style.opacity = "1";
  });
});

logMoodBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

saveMood.addEventListener("click", () => {
  if (!selectedMood || !sleepInput.value) {
    alert("Please select a mood and enter sleep hours!");
    return;
  }

  moods.push({
    mood: selectedMood,
    sleep: parseInt(sleepInput.value),
    date: new Date().toLocaleDateString(),
  });

  updateChart();
  modal.classList.add("hidden");
  sleepInput.value = "";
  selectedMood = null;
});

function updateChart() {
  const ctx = document.getElementById("moodChart").getContext("2d");
  const labels = moods.map((m) => m.date);
  const moodValues = moods.map((m) => {
    switch (m.mood) {
      case "Very Sad": return 1;
      case "Sad": return 2;
      case "Neutral": return 3;
      case "Happy": return 4;
      case "Very Happy": return 5;
      default: return 0;
    }
  });
  const sleepValues = moods.map((m) => m.sleep);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Mood (1-5)",
          data: moodValues,
          borderWidth: 1,
        },
        {
          label: "Sleep (hours)",
          data: sleepValues,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 10 },
      },
    },
  });
}
