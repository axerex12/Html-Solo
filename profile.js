const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const closeProfileModal = document.getElementById('closeProfileModal');
const loginBtn = document.getElementById('loginBtn');
document.getElementById('profileForm').addEventListener('submit', updateUserProfile);

export const showProfileButton = () => {
  profileBtn.style.display = 'inline-block';
};

// Open profile modal
profileBtn.addEventListener('click', () => {
  profileModal.showModal();
});

// Close profile modal
closeProfileModal.addEventListener('click', () => {
  profileModal.close();
});

async function updateUserProfile(event) {
  event.preventDefault();

  const token = localStorage.getItem('token');

  const newUsername = document.getElementById('updateUsername').value.trim();
  const newEmail = document.getElementById('updateEmail').value.trim();
  const newPassword = document.getElementById('updatePassword').value.trim();

  const updates = {};

  if (newUsername) updates.username = newUsername;
  if (newEmail) updates.email = newEmail;
  if (newPassword) updates.password = newPassword;

  try {
      const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/users', {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
          alert(data.message);
          return;
      }

      alert('Profiilin tiedot päivitetty');

      if (newPassword) {
          alert('Salasana vaihdettu. Kirjaudu uudelleen.');
          localStorage.removeItem('token');
          profileModal.close();
          profileBtn.style.display = 'none'; // Hide profile button on logout
          loginBtn.textContent = 'Login';
          localStorage.removeItem('token');
          return;
      }

  } catch (error) {
      console.error('profileupdate', error);
  }
}

