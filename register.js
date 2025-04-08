document.addEventListener('DOMContentLoaded', () => {
  const reginBtn = document.getElementById('reginBtn');
  const registerModal = document.getElementById('registerModal');
  const closeLoginModal = document.getElementById('closeRegisterModal');
  const registerForm = document.getElementById('registerForm');

  // Open login modal
  reginBtn.addEventListener('click', () => {
   registerModal.showModal();
  });

  // Close login modal
  closeLoginModal.addEventListener('click', () => {
   registerModal.close();
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    try {
      const isAuthenticated = await register(username, email, password);

      if (isAuthenticated) {
        // Update UI for logged-in state
        registerModal.close();
        alert('register successful!');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('register error:', error);
      alert('register failed. Please try again.');
    }
  });
  async function register(username, email, password) {
    const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
    });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'register failed');
      }
      const data = await response.json();
      return data;
  }
});
