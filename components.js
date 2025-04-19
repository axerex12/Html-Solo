export const restaurantRow = ({name, company, city}) => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${name}</td>
    <td>${company}</td>
    <td>${city}</td>
  `;
  return tr;
};

export const restaurantModal = (
  restaurant,
  menu,
  isLoggedIn = false,
  isFavorite = false
) => {
  const {_id} = restaurant;
  const {name, address, postalCode, city, phone, company} = restaurant;

  let menuHtml = '';

  if (menu.days) {
    // Weekly menu structure
    menu.days.forEach((day) => {
      menuHtml += `<h3>${day.date}</h3><ul>`;
      day.courses.forEach(({name, price, diet}) => {
        menuHtml += `<li>${name}, ${price || '?€'}${
          diet ? ` (${diet})` : ''
        }</li>`;
      });
      menuHtml += '</ul>';
    });
  } else if (menu.courses) {
    // Daily menu structure
    menuHtml = '<ul>';
    menu.courses.forEach(({name, price, diets}) => {
      menuHtml += `<li>${name}, ${price || '?€'}${
        diets ? ` (${diets})` : ''
      }</li>`;
    });
    menuHtml += '</ul>';
  } else {
    menuHtml = '<p>No menu information available</p>';
  }

  // Favorite button HTML - only shown if user is logged in
  const favoriteButtonHtml = isLoggedIn
    ? `<button id="favorite-btn-${restaurant.id}" class="favorite-btn ${
        isFavorite ? 'favorited' : ''
      }" data-restaurant-id="${restaurant.id}">
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${
           isFavorite ? 'gold' : 'none'
         }" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
         </svg>
       </button>`
    : '';

  // Render the modal HTML
  const modalHtml = `
    <div class="restaurant-modal-header">
      <h1>${name}</h1>
      ${favoriteButtonHtml}
    </div>
    <p>${address}</p>
    <p>${postalCode}, ${city}</p>
    <p>${phone}</p>
    <p>${company}</p>
    ${menuHtml}
  `;

  // Add event listener for the favorite button
  setTimeout(() => {
    const favoriteButton = document.getElementById(
      `favorite-btn-${restaurant.id}`
    );
    if (favoriteButton) {
      favoriteButton.addEventListener('click', () => {
        console.log(`Favorite button clicked for restaurant ID: ${_id}`);
        updateFavoriteRestaurant(_id);
      });
    }
  }, 0);

  return modalHtml;
};

export async function updateFavoriteRestaurant(restaurantId) {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(
      'https://media2.edu.metropolia.fi/restaurant/api/v1/users',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          favouriteRestaurant: restaurantId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data.message);
      return;
    } else console.log('Suosikkiravintola päivitetty:', data);
    alert('Ravintola lisätty suosikiksi!');
  } catch (error) {
    console.error(error);
  }
}
