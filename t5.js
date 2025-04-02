import {baseUrl} from './variables.js';
import {fetchData} from './utils.js';
import {restaurantRow, restaurantModal} from './components.js';

const table = document.querySelector('#target');
const modal = document.querySelector('#modal');
const sodexoButton = document.getElementById('sodexoB');
const compassButton = document.getElementById('compassB');
const menuButton = document.getElementById('weekday');
let currentFilter = null;
let currentMenu = 'daily';
let restaurants = [];

// Login functionality
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const closeLoginModal = document.getElementById('closeLoginModal');
  const loginForm = document.getElementById('loginForm');

  // Initialize UI based on auth state
  const checkAuthState = () => {
    const user = localStorage.getItem('user');
    if (user) {
      updateUILoggedInState(JSON.parse(user));
    }
  };

  // Open login modal
  const loginClickHandler = () => {
    loginModal.showModal();
    document.getElementById('loginError').style.display = 'none';
  };

  // Close login modal
  closeLoginModal.addEventListener('click', () => {
    loginModal.close();
  });

  // Handle form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');

    // Show loading state
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Logging in...';
    submitButton.disabled = true;

    try {
      const response = await loginUser(username, password);
      handleSuccessfulLogin(response);
      loginModal.close();
      updateUILoggedInState(response.user);
    } catch (error) {
      errorElement.textContent = error.message || 'Login failed. Please try again.';
      errorElement.style.display = 'block';
    } finally {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  });

  // Real login function using your baseUrl
  const loginUser = async (username, password) => {
    try {
      const response = await fetch(`${baseUrl}/auth/login`, { // Adjust endpoint as needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleSuccessfulLogin = (response) => {
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
    }
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
  };

  const updateUILoggedInState = (userData) => {
    loginBtn.textContent = 'Logout';
    loginBtn.removeEventListener('click', loginClickHandler);
    loginBtn.addEventListener('click', logoutClickHandler);

    // Update UI with user info if needed
    console.log('Logged in as:', userData.username);
  };

  const logoutClickHandler = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    loginBtn.textContent = 'Login';
    loginBtn.removeEventListener('click', logoutClickHandler);
    loginBtn.addEventListener('click', loginClickHandler);
    console.log('User logged out');
  };

  // Initialize auth state
  checkAuthState();
  loginBtn.addEventListener('click', loginClickHandler);
});

// Restaurant data functions
const getWeeklyMenu = async (id, lang) => {
  try {
    return await fetchData(`${baseUrl}/restaurants/weekly/${id}/${lang}`);
  } catch (error) {
    console.error('Error fetching weekly menu:', error);
    return null;
  }
};

const getDailyMenu = async (id, lang) => {
  try {
    return await fetchData(`${baseUrl}/restaurants/daily/${id}/${lang}`);
  } catch (error) {
    console.error('Error fetching daily menu:', error);
    return null;
  }
};

const getRestaurants = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    restaurants = await fetchData(`${baseUrl}/restaurants`, { headers });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
};

const sortRestaurants = () => {
  restaurants.sort(({name: nameA}, {name: nameB}) =>
    nameA.toUpperCase().localeCompare(nameB.toUpperCase())
  );
};

const createTable = (restaurantsToShow = restaurants) => {
  table.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Address</th>
    </tr>
  `;

  restaurantsToShow.forEach((restaurant) => {
    const tr = restaurantRow(restaurant);
    tr.addEventListener('click', async () => {
      try {
        document.querySelectorAll('.highlight').forEach((elem) => {
          elem.classList.remove('highlight');
        });
        tr.classList.add('highlight');

        const menuFunc = currentMenu === 'daily' ? getDailyMenu : getWeeklyMenu;
        const menu = await menuFunc(restaurant._id, 'fi');
        modal.innerHTML = restaurantModal(restaurant, menu);
        modal.showModal();
      } catch (error) {
        console.error('Error showing restaurant details:', error);
      }
    });
    table.append(tr);
  });
};

const handleFilterClick = (company, filterName) => {
  if (currentFilter === filterName) {
    currentFilter = null;
    sodexoButton.classList.remove('active');
    compassButton.classList.remove('active');
    createTable();
  } else {
    currentFilter = filterName;
    [sodexoButton, compassButton].forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${filterName}B`).classList.add('active');

    const filtered = restaurants.filter(
      (r) => r.company.toLowerCase() === company.toLowerCase()
    );
    createTable(filtered);
  }
};

const handleMenuClick = () => {
  currentMenu = currentMenu === 'daily' ? 'weekly' : 'daily';
  menuButton.textContent = currentMenu;
};

// Event listeners
sodexoButton.addEventListener('click', () => handleFilterClick('sodexo', 'sodexo'));
compassButton.addEventListener('click', () => handleFilterClick('compass group', 'compass'));
menuButton.addEventListener('click', handleMenuClick);

// Main function
const main = async () => {
  try {
    await getRestaurants();
    sortRestaurants();
    createTable();
  } catch (error) {
    console.error('Initialization error:', error);
  }
};

main();
