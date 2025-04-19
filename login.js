document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const profileBtn = document.getElementById('profileBtn'); // Add reference to profile button
  const loginModal = document.getElementById('loginModal');
  const closeLoginModal = document.getElementById('closeLoginModal');
  const loginForm = document.getElementById('loginForm');
  const profileUsername = document.getElementById('profileUsername');
  const profileFormSubmit = document.getElementById('profileForm')

  let isLoggedIn = false;

  profileFormSubmit.addEventListener('submit', (e) => {
    e.preventDefault();
    isLoggedIn = false;
  });

  loginBtn.addEventListener('click', () => {
    if (isLoggedIn) {
      // Handle logout
      isLoggedIn = false;
      localStorage.removeItem('token');
      loginBtn.textContent = 'Login';
      profileBtn.style.display = 'none'; // Hide profile button on logout
      alert('Logged out successfully!');
      profileUsername.textContent = '';
    } else {
      loginModal.showModal();
    }
  });

  closeLoginModal.addEventListener('click', () => {
    loginModal.close();
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
      const isAuthenticated = await login(username, password);

      if (isAuthenticated) {
        isLoggedIn = true;
        loginBtn.textContent = 'Logout';
        profileBtn.style.display = 'inline-block'; // Show profile button on successful login
        loginModal.close(); // Close modal only on successful login
        alert('Login successful!');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);

      if (error.message === 'Invalid credentials') {
        alert('Invalid credentials');
      } else {
        alert('Login failed. Please try again.');
      }
    }
  });

  async function login(username, password) {
    const response = await fetch(
      'https://media2.edu.metropolia.fi/restaurant/api/v1/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username, password}),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        // Handle invalid credentials
        return false;
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token); // Save token to localStorage
    profileUsername.textContent = username || 'User';
    return true; // Return true to indicate successful login
  }
});


