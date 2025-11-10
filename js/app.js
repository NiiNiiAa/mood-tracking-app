const BACKEND_URL = 'https://mood-tracking-app-kappa.vercel.app/';

document.getElementById('signup-form')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!name || !email || !password) {
    alert('Please fill out all fields.');
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: name,
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    alert('Account created successfully! Please log in.');
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Signup Error:', error);
    alert(`Signup failed: ${error.message}`);
  }
});


document.getElementById('login-form')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert('Please provide email and password.');
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();

    localStorage.setItem('authToken', data.token);
    window.location.href = 'index.html';

  } catch (error) {
    console.error('Login Error:', error);
    alert(`Login failed: ${error.message}`);
  }
});