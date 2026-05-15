import axios from 'axios';
import Papa from 'papaparse';
import { Appointment } from '../types';

export async function fetchAppointments(): Promise<Appointment[]> {
  try {
    const response = await axios.get(`/api/appointments?t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    const csvData = response.data;

    if (typeof csvData === 'string' && (csvData.trim().startsWith('<!DOCTYPE') || csvData.trim().startsWith('<html'))) {
      throw new Error('Received HTML instead of CSV from API.');
    }
    
    const parsed: Appointment[] = await new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data.slice(1) as string[][];
          const appointments: Appointment[] = rows.map((row) => ({
            timestamp: row[0] || '',
            clientName: row[1] || '',
            brokerName: row[2] || '',
            superintendence: row[3] || '',
            board: row[4] || '',
            leader: row[5] || '',
            constructor: row[6] || '',
            appointmentDate: row[7] || '',
            origin: row[8] || '',
            isValidated: row[9]?.toLowerCase() === 'sim' || row[9]?.toLowerCase() === 'verdadeiro',
          }));
          resolve(appointments.filter(a => a.clientName));
        },
        error: (error: Error) => reject(error)
      });
    });

    return parsed;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}
