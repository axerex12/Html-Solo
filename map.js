import {fetchRestaurants} from './api.js';

const L = window.L;
let map;
let markers = [];
let restaurants = [];

// Initialize Leaflet map
export function initMap(coordinates = [60.1699, 24.9384]) {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('Map container not found');
    return;
  }

  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    console.error('Invalid coordinates passed to initMap:', coordinates);
    return;
  }

  if (map) {
    map.setView(coordinates, 15);
  } else {
    map = L.map('map').setView(coordinates, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  }

  const [longitude, latitude] = coordinates;
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    const marker = L.marker([latitude, longitude]).addTo(map);
    markers.push(marker);
    console.log('Map initialized with marker:', coordinates);
  }
}

// Add a marker to the map
export function addMarker(coordinates, popupContent = '') {
  if (map && coordinates.length === 2) {
    const marker = L.marker(coordinates).addTo(map);
    if (popupContent) {
      marker.bindPopup(popupContent);
    }
    markers.push(marker);
    return marker; // Return the marker reference
  }
  return null;
}

// Clear all markers from the map
export function clearMarkers() {
  if (!map) {
    console.error('Cannot clear markers - map not initialized');
    return;
  }

  markers.forEach((marker) => {
    if (marker && map.hasLayer(marker)) {
      map.removeLayer(marker);
    }
  });
  markers = [];
  console.log('All markers cleared');
}

// Function to pan the map to specific coordinates
export function panToCoordinates(coordinates) {
  if (!map) {
    console.error('Map is not initialized.');
    return;
  }

  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    console.error(
      'Invalid coordinates passed to panToCoordinates:',
      coordinates
    );
    return;
  }

  const [latitude, longitude] = coordinates;

  if (typeof latitude === 'number' && typeof longitude === 'number') {
    map.panTo([latitude, longitude]);
    console.log(`Map panned to coordinates: [${latitude}, ${longitude}]`);
  } else {
    console.error('Coordinates must be numbers:', coordinates);
  }
}

// Add markers to the map and store them in the markers array
function addMarkers(restaurantsData) {
  clearMarkers(); // Clear existing markers first

  restaurantsData.forEach((restaurant) => {
    const [longitude, latitude] = restaurant.location.coordinates;

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      const popupContent = `
        <h3>${restaurant.name}</h3>
        <p>${restaurant.address}, ${restaurant.postalCode} ${restaurant.city}</p>
      `;

      addMarker([latitude, longitude], popupContent);
    } else {
      console.error(`Invalid coordinates for restaurant: ${restaurant.name}`);
    }
  });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  initMap();

  try {
    restaurants = await fetchRestaurants(); // Assign to global variable
    console.log('restaurants:', restaurants);
    addMarkers(restaurants);

    // Add event listener for clear markers button
    const clearButton = document.getElementById('clearMarkers');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        clearMarkers();
      });
    } else {
      console.error('Clear markers button not found');
    }
  } catch (error) {
    console.error('Error fetching restaurants:', error);
  }
});
