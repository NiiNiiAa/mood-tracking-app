const BACKEND_URL = 'https://mood-tracking-app-kappa.vercel.app/';

// This is a global variable for our chart
let moodChart;

// --- 2. PAGE LOAD ("DOMContentLoaded") ---
// This runs as soon as the HTML page is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if we are on the main dashboard page
  // We use `window.location.pathname` to see which HTML file is loaded
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

// --- 3. MAIN DATA LOADING FUNCTION ---
async function loadDashboard() {
  const token = localStorage.getItem('authToken');

  // **PAGE PROTECTION**
  // If there is no token, the user is not logged in.
  // Redirect them to the login page immediately.
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // We have a token. Let's try to fetch user and dashboard data.
  try {
    // We'll run two requests in parallel for speed
    const [userResponse, dashboardResponse] = await Promise.all([
      // Request 1: Get the user's info (for "Hello, [Name]")
      fetch(`${BACKEND_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }),
      // Request 2: Get the dashboard summary (for charts, averages, etc.)
      fetch(`${BACKEND_URL}/api/dashboard/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }),
    ]);

    // Handle expired or bad token
    if (!userResponse.ok || !dashboardResponse.ok) {
      if (userResponse.status === 401 || dashboardResponse.status === 401) {
        // 401 means "Unauthorized". The token is bad or expired.
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
  document.getElementById('logout-btn').style.display = 'inline-block';

  updateDate();

  if (data.latestReflection) {
    document.getElementById('reflection-mood').textContent = `I'm feeling... ${data.latestReflection.mood}`;
    document.getElementById('reflection-sleep').textContent = `${data.latestReflection.sleepHours} hours`;
    document.getElementById('reflection-notes').textContent = data.latestReflection.notes;
    
    const tagsContainer = document.getElementById('reflection-tags-container');
    tagsContainer.innerHTML = '';
    
    if (data.latestReflection.tags && data.latestReflection.tags.length > 0) {
      data.latestReflection.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
      });
    } else {
      tagsContainer.innerHTML = '<span class="tag-placeholder">No tags added.</span>';
    }

  } else {
    document.getElementById('reflection-mood').textContent = 'Log your first mood!';
    document.getElementById('reflection-sleep').textContent = '... hours';
    document.getElementById('reflection-notes').textContent = 'Log a mood to see your daily reflection.';
  }

  const avgMoodMain = document.getElementById('avg-mood-main');
  const avgMoodSub = document.getElementById('avg-mood-sub');
  const avgSleepMain = document.getElementById('avg-sleep-main');
  const avgSleepSub = document.getElementById('avg-sleep-sub');

  if (data.averages.avgMood !== 'N/A') {
    avgMoodMain.textContent = data.averages.avgMood;
    avgMoodSub.textContent = 'Your average mood from the last 5 logs.';
  } else {
    avgMoodMain.textContent = 'Keep tracking!';
    avgMoodSub.textContent = 'Log 5 check-ins to see your average mood.';
  }

  if (data.averages.avgSleep !== 'N/A') {
    avgSleepMain.textContent = data.averages.avgSleep;
    avgSleepSub.textContent = 'Your average sleep from the last 5 logs.';
  } else {
    avgSleepMain.textContent = 'Not enough data yet!';
    avgSleepSub.textContent = 'Track 5 nights to view average sleep.';
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


