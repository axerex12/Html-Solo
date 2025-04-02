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
    const email = document.getElementById('email').value;

    try {
      const isAuthenticated = await mockLogin(username, password, email);

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

  // Mock login function - replace with real API call
  async function mockLogin(username, password, email) {
    try {
      const response = await fetch(`${baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
          email: email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Login click handler (initial state)
  function loginClickHandler() {
    loginModal.showModal();
  }

  // Logout click handler
  function logoutClickHandler() {
    // Reset UI to logged-out state
    loginBtn.textContent = 'Login';
    loginBtn.removeEventListener('click', logoutClickHandler);
    loginBtn.addEventListener('click', loginClickHandler);
    alert('You have been logged out.');
  }
});
const getWeeklyMenu = async (id, lang) => {
  try {
    return await fetchData(`${baseUrl}/restaurants/weekly/${id}/${lang}`);
  } catch (error) {
    console.error('Error happened Perkele', error);
    return null;
  }
};

// Fetches the daily menu for a restaurant
const getDailyMenu = async (id, lang) => {
  try {
    return await fetchData(`${baseUrl}/restaurants/daily/${id}/${lang}`);
  } catch (error) {
    console.error('An error occurred:', error);
    return null;
  }
};

// Fetches the list of restaurants
const getRestaurants = async () => {
  try {
    restaurants = await fetchData(`${baseUrl}/restaurants`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

// Sorts restaurants alphabetically by name
const sortRestaurants = () => {
  restaurants.sort(({name: nameA}, {name: nameB}) =>
    nameA.toUpperCase().localeCompare(nameB.toUpperCase())
  );
};

// Creates the table of restaurants
const createTable = (restaurantsToShow = restaurants) => {
  // Clear the table first
  table.innerHTML = `<tr>
    <th>Name</th>
    <th>Address</th>
  </tr>
  `;

  restaurantsToShow.forEach((restaurant) => {
    const {_id} = restaurant;
    const tr = restaurantRow(restaurant);
    table.append(tr);

    tr.addEventListener('click', async () => {
      try {
        // Remove existing highlights using forEach
        document.querySelectorAll('.highlight').forEach((elem) => {
          elem.classList.remove('highlight');
        });
        tr.classList.add('highlight');

        // Fetch and display the daily menu
        if (currentMenu === 'daily') {
          const courseResponse = await getDailyMenu(_id, 'fi');
          console.log(courseResponse);

          modal.innerHTML = restaurantModal(restaurant, courseResponse);
          modal.showModal();
        } else if (currentMenu === 'weekly') {
          const courseResponse = await getWeeklyMenu(_id, 'fi');
          modal.innerHTML = restaurantModal(restaurant, courseResponse);

          modal.showModal();
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    });

    table.append(tr);
  });
};

// Helper function to handle filter button clicks
const handleFilterClick = (company, filterName) => {
  if (currentFilter === filterName) {
    // If filter is already active, remove it
    currentFilter = null;
    sodexoButton.classList.remove('active');
    compassButton.classList.remove('active');
    createTable();
  } else {
    // Apply the filter
    currentFilter = filterName;
    const buttons = {sodexo: sodexoButton, compass: compassButton};
    Object.values(buttons).forEach((btn) => btn.classList.remove('active'));
    buttons[filterName].classList.add('active');

    const filtered = restaurants.filter(
      (r) => r.company.toLowerCase() === company.toLowerCase()
    );
    createTable(filtered);
  }
};

const handleMenuClick = () => {
  if (currentMenu === 'daily') {
    menuButton.innerText = 'weekly';

    currentMenu = 'weekly';
  } else {
    currentMenu = 'daily';
    menuButton.innerText = 'daily';
  }
};

// Event listeners for the buttons
sodexoButton.addEventListener('click', () =>
  handleFilterClick('sodexo', 'sodexo')
);

compassButton.addEventListener('click', () =>
  handleFilterClick('compass group', 'compass')
);

menuButton.addEventListener('click', () => handleMenuClick());

// Main function to initialize the app
const main = async () => {
  try {
    await getRestaurants();
    sortRestaurants();
    createTable();
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

main();
