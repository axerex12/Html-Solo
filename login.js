document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const profileBtn = document.getElementById('profileBtn');
  const loginModal = document.getElementById('loginModal');
  const closeLoginModal = document.getElementById('closeLoginModal');
  const loginForm = document.getElementById('loginForm');
  const profileUsername = document.getElementById('profileUsername');
  const profilePictureElement = document.getElementById('profileImage');
  const profileFormSubmit = document.getElementById('profileForm');

  let isLoggedIn = false;

  // Load username from localStorage on page load
  const savedUsername = localStorage.getItem('username');
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
      localStorage.removeItem('username');
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

  async function fetchProfile() {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        'https://media2.edu.metropolia.fi/restaurant/api/v1/users/token',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Virhe käyttäjän tietojen lataamisessa:', error);
      alert('Jokin meni pieleen, yritä uudelleen.');
    }
  }

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
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', username);
    profileUsername.textContent = username || 'User';

    const profileData = await fetchProfile();
    console.log('Profile data!!!!!!!!!!:', profileData.avatar);

    if (profileData.avatar) {
      profilePictureElement.src = `https://media2.edu.metropolia.fi/restaurant/uploads/${profileData.avatar}`;
    } else {
      profilePictureElement.src = '../images/icon.png';
    }

    return true; // Return true to indicate successful login
  }
});
