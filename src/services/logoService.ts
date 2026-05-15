import axios from 'axios';

export async function fetchLogos(): Promise<Record<string, string>> {
  let serverLogos = {};
  try {
    const response = await axios.get(`/api/logos?t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    serverLogos = response.data;
  } catch (error) {
    console.warn('Could not fetch logos from server, using local storage.');
  }

  // Merge with local storage for semi-persistence in same browser
  const localLogosRaw = localStorage.getItem('app_logos');
  const localLogos = localLogosRaw ? JSON.parse(localLogosRaw) : {};
  
  return { ...serverLogos, ...localLogos };
}

export async function saveLogos(logos: Record<string, string>): Promise<void> {
  // Always try to save to localStorage as a primary or fallback
  localStorage.setItem('app_logos', JSON.stringify(logos));
  
  try {
    await axios.post('/api/logos', logos);
  } catch (error) {
    console.error('Error saving logos to server (expected on Vercel):', error);
    // We don't throw because localStorage was successful
  }
}
