const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const closeProfileModal = document.getElementById('closeProfileModal');

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
