document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const closeLoginModal = document.getElementById('closeLoginModal');
  const loginForm = document.getElementById('loginForm');
  const profileBtn = document.getElementById('profileBtn');

  let isLoggedIn = false; // Track login state

  // Open login modal or handle logout
  loginBtn.addEventListener('click', () => {
    if (isLoggedIn) {
      // Handle logout
      isLoggedIn = false;
      localStorage.removeItem('token'); // Clear the token
      loginBtn.textContent = 'Login'; // Update button text
      profileBtn.style.display = 'none'; // Hide profile button
      alert('Logged out successfully!');
    } else {
      // Open login modal
      loginModal.showModal();
    }
  });

  // Close login modal
  closeLoginModal.addEventListener('click', () => {
    loginModal.close();
  });

  // Handle form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
      const isAuthenticated = await login(username, password);

      if (isAuthenticated) {
        // Update UI for logged-in state
        isLoggedIn = true;
        loginBtn.textContent = 'Logout';
        loginModal.close();
        alert('Login successful!');
        profileBtn.style.display = 'inline-block'; // Show profile button
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  });

  async function login(username, password) {
    const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    console.log(response);


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      const data = await response.json();
      localStorage.setItem('token', data.token);
      loginModal.close();
      return data;
  }

  async function checkUserName(username) {
    const response = await fetch(`https://media2.edu.metropolia.fi/restaurant/api/v1/users/available/:${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    console.log(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '');
      }
      const data = await response.json();
      console.log(data);

      return data;
  }

});
