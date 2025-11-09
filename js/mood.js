document.addEventListener('DOMContentLoaded', () => {
  const userData = JSON.parse(localStorage.getItem('currentUser'));
  const welcomeMsg = document.getElementById('welcome-msg');
  const loginBtn = document.getElementById('login-btn');
  const signInBtn = document.getElementById('sign-in-btn');
  const logoutBtn = document.getElementById('logout-btn');

  if (userData) {
    // მომხმარებელი შესულია
    welcomeMsg.textContent = `Hello, ${userData.name}!`;
    loginBtn.style.display = 'none';
    signInBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
  } else {
    welcomeMsg.textContent = 'Hello!';
    loginBtn.style.display = 'inline-block';
    signInBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
  }

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = "login.html";
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // თარიღის ჩვენება
  const dateElement = document.getElementById("current-date");
  const now = new Date();

  const options = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
  const formattedDate = now.toLocaleDateString("en-US", options);

  function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  }

  const day = now.getDate();
  const withSuffix = formattedDate.replace(day.toString(), `${day}${getOrdinalSuffix(day)}`);

  dateElement.textContent = withSuffix;
});




const yLabels = [
  { label: '0-2 h', icon: 'images/icons/icon-sleep.svg' },
  { label: '3-4 h', icon: 'images/icons/icon-sleep.svg' },
  { label: '5-6 h', icon: 'images/icons/icon-sleep.svg' },
  { label: '7-8 h', icon: 'images/icons/icon-sleep.svg' },
  { label: '9+ h', icon: 'images/icons/icon-sleep.svg' }
];

const today = new Date();
const labels = [];
for (let i = 9; i >= 0; i--) {
  const d = new Date(today);
  d.setDate(today.getDate() - i);
  const month = d.toLocaleString('default', { month: 'short' });
  const day = d.getDate();
  labels.push(`${month}\n${day}`);
}

const data = {
  labels: labels,
  datasets: [{
    label: '',
    data: Array(10).fill(null),
    backgroundColor: 'rgba(54, 162, 235, 0.5)',
    borderColor: 'rgba(54, 162, 235, 1)',
    borderWidth: 1
  }]
};

const config = {
  type: 'bar',
  data: data,
  options: {
    responsive: true,
    layout: {
      padding: {
        left: 0,
        right: 20,
        top: 20,
        bottom: 50
      }
    },
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        min: 0,
        max: 4, 
        ticks: {
          stepSize: 1,
          callback: function(value) {
            return yLabels[value] ? yLabels[value].label : '';
          },
          padding: 30
        },
        grid: { drawTicks: false, drawBorder: false }
      },
      x: {
        ticks: {
          callback: function(value, index) {
            return this.getLabelForValue(index).split('\n');
          },
          padding: 10
        },
        grid: { drawTicks: false, drawBorder: false }
      }
    },
    animation: {
      onComplete: function() {
        const chart = this;
        const ctx = chart.ctx;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        yLabels.forEach((item, index) => {
          const y = chart.scales.y.getPixelForValue(index);
          const x = chart.chartArea.left - 80; 
          const img = new Image();
          img.src = item.icon;
          img.onload = () => {
            const newSize = 25 * 0.6; 
            ctx.drawImage(img, x, y - newSize / 2, newSize, newSize);
          };
        });
      }
    }
  }
};

const moodChart = new Chart(
  document.getElementById('moodChart'),
  config
);



const moodOpenBtn = document.getElementById('log-mood-btn');
const moodCloseBtn = document.getElementById('close-mood');
const moodModal = document.getElementById('mood-modal');

moodOpenBtn.addEventListener('click', () => {
  moodModal.classList.remove('hidden');
});

moodCloseBtn.addEventListener('click', () => {
  moodModal.classList.add('hidden');
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
