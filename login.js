document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const profileBtn = document.getElementById('profileBtn');
  const loginModal = document.getElementById('loginModal');
  const closeLoginModal = document.getElementById('closeLoginModal');
  const loginForm = document.getElementById('loginForm');
  const profileUsername = document.getElementById('profileUsername');
  const profilePictureElement = document.getElementById('avatar');
  const profileFormSubmit = document.getElementById('profileForm');

  let isLoggedIn = false;

  // Load profile picture and username from localStorage on page load
  const savedProfilePicture = localStorage.getItem('profilePicture');
  const savedUsername = localStorage.getItem('username');
  if (savedProfilePicture) {
    profilePictureElement.src = savedProfilePicture;
  }
  if (savedUsername) {
    profileUsername.textContent = savedUsername;
  }

  profileFormSubmit.addEventListener('submit', (e) => {
    e.preventDefault();
    isLoggedIn = false;
  });

  loginBtn.addEventListener('click', () => {
    if (isLoggedIn) {
      // Handle logout
      isLoggedIn = false;
      localStorage.removeItem('token');
      localStorage.removeItem('profilePicture');
      localStorage.removeItem('username');
      loginBtn.textContent = 'Login';
      profileBtn.style.display = 'none'; // Hide profile button on logout
      alert('Logged out successfully!');
      profileUsername.textContent = '';
      profilePictureElement.src = '/images/default.png'; // Reset to default picture
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
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token); // Save token to localStorage
    localStorage.setItem('username', username); // Save username to localStorage
    profileUsername.textContent = username || 'User';

    // Check for profile picture
    const profilePicture = data.avatar || '/images/default.png'; // Use default if none exists
    localStorage.setItem('profilePicture', profilePicture); // Save profile picture to localStorage
    profilePictureElement.src = profilePicture;

    return true; // Return true to indicate successful login
  }
});
