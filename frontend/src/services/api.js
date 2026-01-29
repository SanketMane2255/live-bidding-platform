const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function fetchAuctionItems() {
  try {
    const response = await fetch(`${API_BASE_URL}/items`);

    if (!response.ok) {
      throw new Error('Failed to fetch auction items');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching auction items:', error);
    throw error;
  }
}

export async function fetchAuctionItem(itemId) {
  try {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch auction item');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching auction item:', error);
    throw error;
  }
}
