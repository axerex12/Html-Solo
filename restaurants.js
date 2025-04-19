import {baseUrl} from './variables.js';
import {fetchData} from './utils.js';
import {restaurantRow, restaurantModal} from './components.js';
import {addMarkers, panToCoordinates} from './map.js';

const table = document.querySelector('#target');
const modal = document.querySelector('#modal');
const sodexoButton = document.getElementById('sodexoB');
const compassButton = document.getElementById('compassB');
const menuButton = document.getElementById('weekday');
const showfav = document.getElementById('Favourite');
let currentFilter = null;
let currentMenu = 'daily';
let restaurants = [];

const getFavRestaurant = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseUrl}/users/token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching favorite restaurant:', errorData.message);
      return null;
    }

    const data = await response.json();
    let favId = data.favouriteRestaurant;

    return favId;
  } catch (error) {
    console.error('Error fetching favorite restaurant:', error);
    return null;
  }
};

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
    <th>Company</th>
    <th>City</th>
  </tr>
  `;

  restaurantsToShow.forEach(async (restaurant) => {
    const {_id} = restaurant;
    const tr = restaurantRow(restaurant);
    table.append(tr);

    tr.addEventListener('click', async () => {
      const favorites = await getFavRestaurant();
      console.log('favorites', favorites, _id);

      let isFavorite = Boolean;
      if (favorites === _id) {
        isFavorite = true;
      } else {
        isFavorite = false;
      }

      try {
        document.querySelectorAll('.highlight').forEach((elem) => {
          elem.classList.remove('highlight');
        });
        tr.classList.add('highlight');

        // Fetch and display the daily or weekly menu
        if (currentMenu === 'daily') {
          const courseResponse = await getDailyMenu(_id, 'fi');
          modal.innerHTML = restaurantModal(
            restaurant,
            courseResponse,
            localStorage.getItem('token'),
            isFavorite
          );
          modal.showModal();
        } else if (currentMenu === 'weekly') {
          const courseResponse = await getWeeklyMenu(_id, 'fi');
          modal.innerHTML = restaurantModal(
            restaurant,
            courseResponse,
            localStorage.getItem('token'),
            isFavorite
          );
          modal.showModal();
        }

        // Pan the map to the restaurant's coordinates
        if (restaurant.location && restaurant.location.coordinates) {
          const [longitude, latitude] = restaurant.location.coordinates;
          panToCoordinates([latitude, longitude]);
        } else {
          console.error(
            `No valid coordinates for restaurant: ${restaurant.name}`
          );
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
    addMarkers(restaurants); // Show all markers
  } else {
    // Apply the filter
    currentFilter = filterName;
    const buttons = {sodexo: sodexoButton, compass: compassButton};
    Object.values(buttons).forEach((btn) => btn.classList.remove('active'));
    buttons[filterName].classList.add('active');

    const filtered = restaurants.filter(
      (r) => r.company.toLowerCase() === company.toLowerCase()
    );
    addMarkers(filtered); // Update the map markers
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

showfav.addEventListener('click', async () => {
  try {
    const favId = await getFavRestaurant();
    if (!localStorage.getItem('token')) {
      alert('Please log in to view your favorite restaurant.');
      return;
    }

    if (!favId) {
      alert('you havent selected a favourite restaurant.');
      return;
    }

    const favoriteRestaurant = restaurants.find(
      (restaurant) => restaurant._id === favId
    );
    if (!favoriteRestaurant) {
      console.error('Favorite restaurant not found in the list.');
      return;
    }

    const isFavorite = true;
    const courseResponse =
      currentMenu === 'daily'
        ? await getDailyMenu(favId, 'fi')
        : await getWeeklyMenu(favId, 'fi');

    modal.innerHTML = restaurantModal(
      favoriteRestaurant,
      courseResponse,
      localStorage.getItem('token'),
      isFavorite
    );
    modal.showModal();

    if (
      favoriteRestaurant.location &&
      favoriteRestaurant.location.coordinates
    ) {
      const [longitude, latitude] = favoriteRestaurant.location.coordinates;
      panToCoordinates([latitude, longitude]);
    } else {
      console.error(
        `No valid coordinates for restaurant: ${favoriteRestaurant.name}`
      );
    }
  } catch (error) {
    console.error(
      'An error occurred while showing the favorite restaurant:',
      error
    );
  }
});

// Main function to initialize the app
const main = async () => {
  try {
    localStorage.removeItem('token');
    await getRestaurants();
    sortRestaurants();
    createTable();
  } catch (error) {
    console.error('error', error);
  }
};

main();

document.addEventListener('DOMContentLoaded', () => {
  const citySearch = document.getElementById('citySearch');

  citySearch.addEventListener('input', () => {
    const searchValue = citySearch.value.toLowerCase();

    const filteredRestaurants = restaurants.filter((restaurant) =>
      restaurant.city.toLowerCase().includes(searchValue)
    );

    createTable(filteredRestaurants);
    addMarkers(filteredRestaurants); // Update the table and map markers
  });
});
