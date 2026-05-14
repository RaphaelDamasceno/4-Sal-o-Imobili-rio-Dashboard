import axios from 'axios';

export async function fetchLogos(): Promise<Record<string, string>> {
  try {
    const response = await axios.get(`/api/logos?t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching logos:', error);
    return {};
  }
}

export async function saveLogos(logos: Record<string, string>): Promise<void> {
  try {
    await axios.post('/api/logos', logos);
  } catch (error) {
    console.error('Error saving logos:', error);
    throw error;
  }
}
