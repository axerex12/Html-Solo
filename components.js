
export const restaurantRow = ({ name, company }) => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${name}</td>
    <td>${company}</td>
  `;
  return tr;
};


export const restaurantModal = (restaurant, menu) => {
  const { name, address, postalCode, city, phone, company } = restaurant;

  let menuHtml = '';

  if (menu.days) {
    // Weekly menu structure
    menu.days.forEach(day => {
      menuHtml += `<h3>${day.date}</h3><ul>`;
      day.courses.forEach(({ name, price, diet }) => {
        menuHtml += `<li>${name}, ${price || '?€'}${diet ? ` (${diet})` : ''}</li>`;
      });
      menuHtml += '</ul>';
    });
  } else if (menu.courses) {
    // Daily menu structure
    menuHtml = '<ul>';
    menu.courses.forEach(({ name, price, diets }) => {
      menuHtml += `<li>${name}, ${price || '?€'}${diets ? ` (${diets})` : ''}</li>`;
    });
    menuHtml += '</ul>';
  } else {
    menuHtml = '<p>No menu information available</p>';
  }

  return `
    <h1>${name}</h1>
    <p>${address}</p>
    <p>${postalCode}, ${city}</p>
    <p>${phone}</p>
    <p>${company}</p>
    ${menuHtml}
  `;
};
