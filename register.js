document.addEventListener('DOMContentLoaded', () => {
  const reginBtn = document.getElementById('reginBtn');
  const registerModal = document.getElementById('registerModal');
  const closeLoginModal = document.getElementById('closeRegisterModal');

  // Open login modal
  reginBtn.addEventListener('click', () => {
   registerModal.showModal();
  });

  // Close login modal
  closeLoginModal.addEventListener('click', () => {
   registerModal.close();
  });

  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerusername').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('registerpassword').value;

    try {
        const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, email })

        });
        console.log(JSON.stringify({ username, password, email }))

        const data = await response.json();

        if (response.ok) {
            alert('Rekisteröinti onnistui!', data);
        } else {
            console.log('Rekisteröinti epäonnistui', data);
        }
    } catch (error) {
        console.error('Rekisteröinti virhe:', error);
        alert('Jokin meni pieleen, yritä uudelleen.');
    }
});
});
