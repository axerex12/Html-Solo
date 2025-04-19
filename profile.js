const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const closeProfileModal = document.getElementById('closeProfileModal');
const loginBtn = document.getElementById('loginBtn');
const currentProfilePicture = document.getElementById('currentProfilePicture');
const modalUsername = document.getElementById('displayUsername');
document.getElementById('avatar-form').addEventListener('submit', changeAvatar);
document
  .getElementById('profileForm')
  .addEventListener('submit', updateUserProfile);

export const showProfileButton = () => {
  profileBtn.style.display = 'inline-block';
};

// Open profile modal
profileBtn.addEventListener('click', () => {
  currentProfilePicture.src = document.getElementById('profileImage').src;
  modalUsername.textContent = document.getElementById('profileUsername').textContent
  profileModal.showModal();
});

// Close profile modal
closeProfileModal.addEventListener('click', () => {
  profileModal.close();
});

async function changeAvatar(event) {
  event.preventDefault();

  const token = localStorage.getItem('token');

  const fileInput = document.getElementById('avatar');
  const file = fileInput.files[0];

  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await fetch(
      'https://media2.edu.metropolia.fi/restaurant/api/v1/users/avatar',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    alert('Profiilikuva päivitetty');
    const avatarUrl = `https://media2.edu.metropolia.fi/restaurant/uploads/${
      data.data.avatar
    }?t=${Date.now()}`;
    console.log('avatarUrl', avatarUrl);

    // Update the profile image
    document.getElementById('profileImage').src = avatarUrl;
    profileModal.close();
  } catch (error) {
    console.error('avatarupdate', error);
  }
}

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
    const response = await fetch(
      'https://media2.edu.metropolia.fi/restaurant/api/v1/users',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      }
    );

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
