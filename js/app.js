// LOGIN FORM
document.getElementById('login-form')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (email && password) {
    const name = email.split('@')[0]; 
    localStorage.setItem('currentUser', JSON.stringify({ name, email }));
    window.location.href = "dashboard.html";
  }
});

// SIGN-UP FORM
document.getElementById('signup-form')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (name && email && password) {
    localStorage.setItem('registeredUser', JSON.stringify({ name, email, password }));
    alert(`Account created for ${name}!`);
    window.location.href = "login.html";
  }
});



let currentUser = null; 

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
    currentUser = { name: 'Lisa' }; 
    updateUI();
  });

  signInBtn.addEventListener('click', () => {
    currentUser = { name: 'John' };
    updateUI();
  });

  logoutBtn.addEventListener('click', () => {
    currentUser = null;
    updateUI();
  });

  updateUI();

