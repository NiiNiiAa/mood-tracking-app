const BACKEND_URL = 'https://mood-tracking-app-kappa.vercel.app';

let moodChart;

document.addEventListener('DOMContentLoaded', () => {
  if (
    window.location.pathname.endsWith('index.html') ||
    window.location.pathname.endsWith('/')
  ) {
    loadDashboard();
  }

  const moodOpenBtn = document.getElementById('log-mood-btn');
  const moodCloseBtn = document.getElementById('close-mood');
  const moodModal = document.getElementById('mood-modal');

  moodOpenBtn?.addEventListener('click', () => {
    moodModal.classList.remove('hidden');
  });

  moodCloseBtn?.addEventListener('click', () => {
    moodModal.classList.add('hidden');
  });

  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
  });
});

async function loadDashboard() {
  const token = localStorage.getItem('authToken');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const [userResponse, dashboardResponse] = await Promise.all([
      fetch(`${BACKEND_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }),
      fetch(`${BACKEND_URL}/api/dashboard/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }),
    ]);

    if (!userResponse.ok || !dashboardResponse.ok) {
      if (userResponse.status === 401 || dashboardResponse.status === 401) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
        return;
      }
      throw new Error('Could not load dashboard data.');
    }

    const user = await userResponse.json();
    const dashboardData = await dashboardResponse.json();

    updateDashboardUI(user, dashboardData);

  } catch (error) {
    console.error('Failed to load dashboard:', error);
    alert(`Error: ${error.message}`);
  }
}

function updateDashboardUI(user, data) {
  const welcomeMsg = document.getElementById('welcome-msg');
  if (welcomeMsg) {
    welcomeMsg.textContent = `Hello, ${user.fullName}!`;
  }

  document.getElementById('login-btn').style.display = 'none';
  document.getElementById('sign-in-btn').style.display = 'none';
  document.querySelectorAll('#logout-btn').forEach(btn => {
    btn.style.display = 'inline-block';
  });


  updateDate();

  const avgMoodCard = document.querySelector('.left-panel .stat-box:nth-child(1) .stat-card');
  const avgSleepCard = document.querySelector('.left-panel .stat-box:nth-child(2) .stat-card');

  if (data.averages.avgMood !== 'N/A') {
    avgMoodCard.querySelector('.main-text').textContent = data.averages.avgMood;
    avgMoodCard.querySelector('.sub-text').textContent = 'Your average mood from the last 5 logs.';
  } else {
    avgMoodCard.querySelector('.main-text').textContent = 'Keep tracking!';
    avgMoodCard.querySelector('.sub-text').textContent = 'Log 5 check-ins to see your average mood.';
  }

  if (data.averages.avgSleep !== 'N/A') {
    avgSleepCard.querySelector('.main-text').textContent = data.averages.avgSleep;
    avgSleepCard.querySelector('.sub-text').textContent = 'Your average sleep from the last 5 logs.';
  } else {
    avgSleepCard.querySelector('.main-text').textContent = 'Not enough data yet!';
    avgSleepCard.querySelector('.sub-text').textContent = 'Track 5 nights to view average sleep.';
  }

  initializeChart(data.trends);
}

function updateDate() {
  const dateElement = document.getElementById('current-date');
  if (!dateElement) return;

  const now = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  const formattedDate = now.toLocaleDateString('en-US', options);

  function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
  const day = now.getDate();
  const withSuffix = formattedDate.replace(day.toString(), `${day}${getOrdinalSuffix(day)}`);
  dateElement.textContent = withSuffix;
}

function initializeChart(trendsData) {
  const ctx = document.getElementById('moodChart');
  if (!ctx) return;

  const sleepToValue = {
    '1-2': 0,
    '3-4': 1,
    '5-6': 2,
    '7-8': 3,
    '9+': 4,
  };

  const chartLabels = trendsData.map(log => {
    const d = new Date(log.date);
    const month = d.toLocaleString('default', { month: 'short' });
    const day = d.getDate();
    return `${month}\n${day}`;
  });

  const chartData = trendsData.map(log => sleepToValue[log.sleepHours] ?? null);


  const yLabels = [
    { label: '0-2 h', icon: 'images/icons/icon-sleep.svg' },
    { label: '3-4 h', icon: 'images/icons/icon-sleep.svg' },
    { label: '5-6 h', icon: 'images/icons/icon-sleep.svg' },
    { label: '7-8 h', icon: 'images/icons/icon-sleep.svg' },
    { label: '9+ h', icon: 'images/icons/icon-sleep.svg' }
  ];

  const data = {
    labels: chartLabels,
    datasets: [{
      label: '',
      data: chartData,
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
      layout: { padding: { left: 0, right: 20, top: 20, bottom: 50 } },
      plugins: { legend: { display: false } },
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

  if (moodChart) {
    moodChart.data.labels = chartLabels;
    moodChart.data.datasets[0].data = chartData;
    moodChart.update();
  } else {
    moodChart = new Chart(ctx, config);
  }
}


