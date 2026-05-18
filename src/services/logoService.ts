import axios from 'axios';

const DEFAULT_LOGOS: Record<string, string> = {
  'MRV': 'https://maraalcaineimoveis.com.br/wp-content/uploads/2021/09/mrv-engenharia-sao-jose-do-rio-preto-sp.jpg',
  'DUE': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQ9GpiqTnifLKZxk3yI4LhNJONEPZHmHwXuA&s',
  'EXATA': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT25r5a8xJrC4VfwoiSKsFixyd3MBm2osygcQ&s',
  'VL': 'https://media.glassdoor.com/sqll/2710128/vl-construtora-squarelogo-1643286816827.png',
  'CASA ORANGE': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkrPnozAaQ7lTjwZ9PwyLUf9OSNUAEhN5oKQ&s',
  'BORA': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6OrgSsvn6YW82tjdVao5s_I-2YqPhNEK8OA&s',
  'MRV ENGENHARIA': 'https://maraalcaineimoveis.com.br/wp-content/uploads/2021/09/mrv-engenharia-sao-jose-do-rio-preto-sp.jpg',
  'VL CONSTRUTORA': 'https://media.glassdoor.com/sqll/2710128/vl-construtora-squarelogo-1643286816827.png',
  'TENÓRIO SIMÕES': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp8D0qMcC1zw35N4OC2tdJ9iKnbQg6ySeO_g&s',
  'NASCIMENTO': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjRoBUYMt7B7DrNYlo3mXgiekUevVcObnlrg&s',
  'STUPP': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTeScyF7D0ljHXij1OQ5TbnAnYeo9GaLhDng&s',
  'STÜPP': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTeScyF7D0ljHXij1OQ5TbnAnYeo9GaLhDng&s',
  'CETA': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz5024Ef_TuoUCofDh1zBQyH6DuXrYV7l4ng&s',
};

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
  
  // DEFAULT_LOGOS contains the requested specific logos, they should have priority 
  // or at least be merged in a way that the user's request is respected.
  return { ...serverLogos, ...localLogos, ...DEFAULT_LOGOS };
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
