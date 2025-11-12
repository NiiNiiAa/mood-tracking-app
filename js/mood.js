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

  // document.getElementById('login-btn').style.display = 'none';
  // document.getElementById('sign-in-btn').style.display = 'none';
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







// გრაფიკი
let moodChart1;
let trendsData = []; 

function addMoodLog(newLog) {

  trendsData.push(newLog);
  if (trendsData.length > 10) trendsData.shift();

  updateLeftPanel();

  initializeChart(trendsData);
}

function updateLeftPanel() {
  const avgMoodCard = document.getElementById("avgMoodCard");
  const avgSleepCard = document.getElementById("avgSleepCard");

  if (trendsData.length === 0) {
    avgMoodCard.innerHTML = `
      <p class="main-text">Keep tracking!</p>
      <p class="sub-text">Log 5 check-ins to see your average mood.</p>`;
    avgSleepCard.innerHTML = `
      <p class="main-text">Not enough data yet!</p>
      <p class="sub-text">Track 5 nights to view average sleep.</p>`;
    return;
  }

  const recent = trendsData.slice(-5);

  const moodValues = {
    'Happy': 5, 'Excited': 4, 'Neutral': 3, 'Tired': 2, 'Sad': 1
  };
  const sleepValues = { '0-2': 1, '3-4': 2, '5-6': 3, '7-8': 4, '9+': 5 };

  const avgMoodVal = Math.round(
    recent.reduce((a, b) => a + (moodValues[b.mood] || 0), 0) / recent.length
  );

  const avgSleepVal = Math.round(
    recent.reduce((a, b) => a + (sleepValues[b.sleepHours] || 0), 0) / recent.length
  );

  const moodKeys = Object.keys(moodValues);
  const sleepKeys = Object.keys(sleepValues);

  const avgMood = moodKeys.find(k => moodValues[k] === avgMoodVal) || 'Neutral';
  const avgSleep = sleepKeys.find(k => sleepValues[k] === avgSleepVal) || '5-6';

  avgMoodCard.innerHTML = `
    <img src="images/m/${avgMood.toLowerCase()}.svg" alt="${avgMood}" class="avg-img">
    <p class="main-text">${avgMood}</p>
    <p class="sub-text">Same as the previous 5 check-ins</p>`;

  avgSleepCard.innerHTML = `
    <img src="images/icons/icon-sleep.svg" alt="sleep" class="avg-img">
    <p class="main-text">${avgSleep} Hours</p>
    <p class="sub-text">Increase from the previous 5 check-ins</p>`;
}

    

function initializeChart(trendsData) {
  const ctx = document.getElementById('moodChart1');
  if (!ctx) return;

  ctx.parentElement.style.height = '200px';

  const sleepToValue = { '0-2': 0, '3-4': 1, '5-6': 2, '7-8': 3, '9+': 4 };

  const dates = [];
  for (let i = 10; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0,0,0,0);
    dates.push(d);
  }

  const dataMap = {};
  trendsData.forEach(log => {
    const d = new Date(log.date);
    d.setHours(0,0,0,0);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    dataMap[key] = { 
      value: sleepToValue[log.sleepHours] ?? null,
      mood: log.mood 
    };
  });

  const chartData = dates.map(d => {
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    return dataMap[key]?.value ?? null;
  });

  const moodColors = {
    'happy': '#FFC97C',
    'excited': '#89E780',
    'neutral': '#89CAFF',
    'tired': '#B8B1FF',
    'sad': '#FF9B99'
  };

  const barColors = trendsData.map(log => moodColors[log.mood?.toLowerCase()] || '#89CAFF');

  const data = {
    labels: dates.map(d => d.toISOString()),
    datasets: [{
      data: chartData,
      backgroundColor: barColors,
      borderRadius: 50,
      borderSkipped: false,
    }]
  };

  const config = {
    type: 'bar',
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 30, left: 0, right: 10, bottom: 10 }
      },
      plugins: { legend: { display: false } },
      scales: {
        y: {
          min: 0,
          max: 4,
          ticks: { display: false },
          grid: { drawTicks: false, drawBorder: false, drawOnChartArea: false,  color: 'transparent' }
        },
        x: {
          ticks: { display: false },
          grid: { drawTicks: false, drawBorder: false, drawOnChartArea: false,  color: 'transparent' }
        }
      }
    },
    plugins: [
      {
        id: 'drawMoodIcons',
        afterDatasetsDraw(chart) {
          const ctx = chart.ctx;
          const meta = chart.getDatasetMeta(0);
          meta.data.forEach((bar, i) => {
            const mood = trendsData[i]?.mood?.toLowerCase();
            if (!mood) return;
            const img = new Image();
            img.src = `images/moods/${mood}.svg`;
            img.onload = () => {
              const size = 24;
              ctx.drawImage(img, bar.x - size / 2, bar.y - size - 6, size, size);
            };
          });
        }
      }
    ]
  };

  if (moodChart1) moodChart1.destroy();
  moodChart1 = new Chart(ctx, config);

  const xAxisContainer = ctx.parentElement.querySelector('.x-axis-labels');
  xAxisContainer.innerHTML = '';
  dates.forEach(d => {
    const month = d.toLocaleString('default', { month: 'short' });
    const day = d.getDate();
    const labelDiv = document.createElement('div');
    labelDiv.classList.add('item');
    labelDiv.innerHTML = `<span>${month}</span><span>${day}</span>`;
    xAxisContainer.appendChild(labelDiv);
  });
}








// DROPDOWN მენიუ
document.addEventListener('DOMContentLoaded', () => {
  const profileImg = document.getElementById('profile-img');
  const arrow = document.querySelector('.arrow');
  const dropdown = document.getElementById('dropdown-menu');
  const settingsBtn = document.getElementById('settings-btn');
  const logoutBtn = document.getElementById('logout-btn');

  function toggleDropdown() {
    dropdown.classList.toggle('hidden');
  }

  if (profileImg) profileImg.addEventListener('click', toggleDropdown);
  if (arrow) arrow.addEventListener('click', toggleDropdown);

  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName');
  const email = localStorage.getItem('email');

  if (firstName && lastName && email) {
    document.getElementById('user-name').textContent = `${firstName} ${lastName}`;
    document.getElementById('user-email').textContent = email;
  }
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      window.location.href = 'profile.html';
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = 'login.html';
    });
  }

  const savedName = localStorage.getItem('userName');
  const savedImage = localStorage.getItem('userImage');
  const welcomeMsg = document.getElementById('welcome-msg');

  if (savedName && welcomeMsg) {
    welcomeMsg.textContent = `Hello, ${savedName}!`;
  }

  if (savedImage && profileImg) {
    profileImg.src = savedImage;
  }
});






// SETTINGS
function updateUserProfileFromStorage() {
  const savedName = localStorage.getItem('userName');
  const savedImage = localStorage.getItem('userImage');
  const welcomeMsg = document.getElementById('welcome-msg');
  // const profileImg = document.getElementById('profile-toggle');
  const profileImg = document.getElementById('profile-img');


  if (savedName && welcomeMsg) {
    welcomeMsg.textContent = `Hello, ${savedName}!`;
  }

  if (savedImage && profileImg) {
    profileImg.src = savedImage;
  }
}

document.addEventListener('DOMContentLoaded', updateUserProfileFromStorage);

setInterval(updateUserProfileFromStorage, 5000);




document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".mood-step");
  const progressSteps = document.querySelectorAll(".progress-step");

  const continueBtn1 = document.getElementById("continue-btn");
  const continueBtn2 = document.getElementById("continue-btn-2");
  const continueBtn3 = document.getElementById("continue-btn-3");
  const submitBtn = document.getElementById("submit-btn");

  const moodError = document.getElementById("mood-error");
  const tagsError = document.getElementById("tags-error");
  const textError = document.getElementById("text-error");
  const sleepError = document.getElementById("sleep-error");

  const tagsContainer = document.getElementById("tags-container");
  const textArea = document.getElementById("mood-text");
  const charCounter = document.getElementById("char-counter");

  let currentStep = 1;
  let selectedTags = [];

  const tags = [
    "Joyful", "Down", "Anxious", "Calm", "Excited", "Frustrated",
    "Lonely", "Grateful", "Overwhelmed", "Motivated", "Irritable", "Peaceful",
    "Tired", "Hopeful", "Confident", "Stressed", "Content", "Disappointed", "Optimistic", "Restless"
  ];

  if (tagsContainer) {
    tags.forEach(tag => {
      const div = document.createElement("div");
      div.classList.add("tag-option");
      div.textContent = tag;
      tagsContainer.appendChild(div);
    });
  }

// პირველი
  if (continueBtn1) {
    continueBtn1.addEventListener("click", () => {
      const selectedMood = document.querySelector('input[name="mood"]:checked');
      if (!selectedMood) {
        moodError.classList.remove("hidden");
        return;
      }
      moodError.classList.add("hidden");
      nextStep();
    });
  }

  // მეორე
  if (tagsContainer) {
    tagsContainer.addEventListener("click", (e) => {
      if (!e.target.classList.contains("tag-option")) return;

      const tag = e.target.textContent;

      if (selectedTags.includes(tag)) {
        selectedTags = selectedTags.filter(t => t !== tag);
        e.target.classList.remove("selected");
      } else {
        if (selectedTags.length >= 3) {
          tagsError.textContent = "You can only select a maximum of 3 tags.";
          tagsError.classList.remove("hidden");
          return;
        }
        selectedTags.push(tag);
        e.target.classList.add("selected");
      }

      if (selectedTags.length <= 3) tagsError.classList.add("hidden");
    });
  }

  if (continueBtn2) {
    continueBtn2.addEventListener("click", () => {
      if (selectedTags.length === 0) {
        tagsError.textContent = "Please select at least one tag.";
        tagsError.classList.remove("hidden");
        return;
      }
      tagsError.classList.add("hidden");
      nextStep();
    });
  }

  // მესამე
  if (textArea && charCounter) {
    charCounter.textContent = `${textArea.value.length}/150`;

    textArea.addEventListener("input", () => {
      let len = textArea.value.length;
      if (len > 150) {
        textArea.value = textArea.value.slice(0, 150);
        len = 150;
      }
      charCounter.textContent = `${len}/150`;

      if (textArea.value.trim().length > 0) {
        textError.classList.add("hidden");
      }
    });
  }

  if (continueBtn3) {
    continueBtn3.addEventListener("click", () => {
      const textValue = textArea.value;
      if (textValue.trim().length === 0) {
        textError.textContent = "Please write a few words about your day before continuing.";
        textError.classList.remove("hidden");
        return;
      }
      textError.classList.add("hidden");
      nextStep();
    });
  }

  // მეოთხე
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const selectedSleep = document.querySelector('input[name="sleep"]:checked');
      if (!selectedSleep) {
        sleepError.textContent = "Please select how many hours you slept.";
        sleepError.classList.remove("hidden");
        return;
      }
      sleepError.classList.add("hidden");

      alert("Mood successfully logged!");
      document.getElementById("mood-modal").classList.add("hidden");
    });
  }

  function nextStep() {
    steps[currentStep - 1].classList.add("hidden");
    steps[currentStep - 1].classList.remove("active");
    currentStep++;
    if (steps[currentStep - 1]) {
      steps[currentStep - 1].classList.remove("hidden");
      steps[currentStep - 1].classList.add("active");
      progressSteps.forEach((s, i) => {
        s.classList.toggle("active", i < currentStep);
      });
    }
  }
});
