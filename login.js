// Login functionality
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const closeLoginModal = document.getElementById('closeLoginModal');
  const loginForm = document.getElementById('loginForm');

  // Open login modal
  loginBtn.addEventListener('click', () => {
    loginModal.showModal();
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
        loginBtn.textContent = 'Logout';
        loginBtn.removeEventListener('click', loginClickHandler);
        loginBtn.addEventListener('click', logoutClickHandler);
        loginModal.close();
        alert('Login successful!');
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
      return data;
  }

  // Login click handler (initial state)
  function loginClickHandler() {
    loginModal.showModal();
  }

});
