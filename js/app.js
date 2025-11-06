document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (email && password) {
    alert(`Welcome back, ${email}!`);
    window.location.href = "index.html"; 
  }
});


// Sign-up ფორმა
document.getElementById('signup-form')?.addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (name && email && password) {
    alert(`Account created for ${name}!`);
    window.location.href = "login.html"; 
  }
});



let currentUser = null; // null means not logged in

  const loginBtn = document.getElementById('login-btn');
  const signInBtn = document.getElementById('sign-in-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const welcomeMsg = document.getElementById('welcome-msg');

  function updateUI() {
    if (currentUser) {
      loginBtn.style.display = 'none';
      signInBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      welcomeMsg.textContent = `Hello, ${currentUser.name}!`;
    } else {
      loginBtn.style.display = 'inline-block';
      signInBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
      welcomeMsg.textContent = 'Hello!';
    }
  }

  loginBtn.addEventListener('click', () => {
    // Simulate login
    currentUser = { name: 'Lisa' }; // In real app, get from form/auth
    updateUI();
  });

  signInBtn.addEventListener('click', () => {
    // Simulate sign in / registration
    currentUser = { name: 'John' };
    updateUI();
  });

  logoutBtn.addEventListener('click', () => {
    currentUser = null;
    updateUI();
  });

  // Initial UI update
  updateUI();

