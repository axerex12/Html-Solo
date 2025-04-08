export async function fetchRestaurants() {
  try {
      const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants');
      if (!response.ok) throw new Error(response.status);
      const data = await response.json();
      return data.restaurants || data;
  } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
  }
}
