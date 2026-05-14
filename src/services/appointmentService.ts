import axios from 'axios';
import Papa from 'papaparse';
import { Appointment } from '../types';

const MOCK_DATA: Appointment[] = [
  {
    timestamp: "2026-05-14 10:00:00",
    clientName: "Paula Carolina",
    brokerName: "Raphael Damasceno",
    superintendence: "Hub On",
    board: "Tecnologia",
    leader: "Líder Alpha",
    constructor: "Hub On",
    appointmentDate: "2026-05-15",
    origin: "Carteira",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 10:15:00",
    clientName: "Marcos Oliveira",
    brokerName: "Ana Silva",
    superintendence: "Vendas Sul",
    board: "Comercial",
    leader: "Líder Beta",
    constructor: "Vertical Engenharia",
    appointmentDate: "2026-05-16",
    origin: "Lead Digital",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 10:30:00",
    clientName: "Juliana Santos",
    brokerName: "Raphael Damasceno",
    superintendence: "Hub On",
    board: "Tecnologia",
    leader: "Líder Alpha",
    constructor: "Hub On",
    appointmentDate: "2026-05-15",
    origin: "Indicação",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 10:45:00",
    clientName: "Ricardo Pereira",
    brokerName: "Pedro Costa",
    superintendence: "Vendas Norte",
    board: "Operações",
    leader: "Líder Gamma",
    constructor: "Horizonte Urbano",
    appointmentDate: "2026-05-17",
    origin: "Stand de Vendas",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 11:00:00",
    clientName: "Fernanda Lima",
    brokerName: "Ana Silva",
    superintendence: "Vendas Sul",
    board: "Comercial",
    leader: "Líder Beta",
    constructor: "Vertical Engenharia",
    appointmentDate: "2026-05-16",
    origin: "Lead Digital",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 11:15:00",
    clientName: "Lucas Mendes",
    brokerName: "Raphael Damasceno",
    superintendence: "Hub On",
    board: "Tecnologia",
    leader: "Líder Alpha",
    constructor: "Hub On",
    appointmentDate: "2026-05-18",
    origin: "Carteira",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 11:30:00",
    clientName: "Carla Souza",
    brokerName: "Pedro Costa",
    superintendence: "Vendas Norte",
    board: "Operações",
    leader: "Líder Gamma",
    constructor: "Horizonte Urbano",
    appointmentDate: "2026-05-17",
    origin: "Stand de Vendas",
    isValidated: false
  },
  {
    timestamp: "2026-05-14 11:45:00",
    clientName: "Gustavo Rocha",
    brokerName: "Ana Silva",
    superintendence: "Vendas Sul",
    board: "Comercial",
    leader: "Líder Beta",
    constructor: "Vertical Engenharia",
    appointmentDate: "2026-05-16",
    origin: "Lead Digital",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 12:00:00",
    clientName: "Beatriz Nogueira",
    brokerName: "Raphael Damasceno",
    superintendence: "Hub On",
    board: "Tecnologia",
    leader: "Líder Alpha",
    constructor: "Hub On",
    appointmentDate: "2026-05-19",
    origin: "Indicação",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 12:15:00",
    clientName: "Tiago Abravanel",
    brokerName: "Clara Nunes",
    superintendence: "Vendas Leste",
    board: "Novos Negócios",
    leader: "Líder Delta",
    constructor: "Plano & Plano",
    appointmentDate: "2026-05-20",
    origin: "Campanha TV",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 12:30:00",
    clientName: "Bruno Gagliasso",
    brokerName: "Raphael Damasceno",
    superintendence: "Hub On",
    board: "Tecnologia",
    leader: "Líder Alpha",
    constructor: "Cyrela",
    appointmentDate: "2026-05-21",
    origin: "Instagram",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 12:45:00",
    clientName: "Marina Ruy Barbosa",
    brokerName: "Clara Nunes",
    superintendence: "Vendas Leste",
    board: "Novos Negócios",
    leader: "Líder Delta",
    constructor: "Moura Dubeux",
    appointmentDate: "2026-05-22",
    origin: "Lead Digital",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 13:00:00",
    clientName: "Lázaro Ramos",
    brokerName: "Pedro Costa",
    superintendence: "Vendas Norte",
    board: "Marketing",
    leader: "Líder Epsilon",
    constructor: "MRV",
    appointmentDate: "2026-05-23",
    origin: "Carteira",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 13:15:00",
    clientName: "Taís Araújo",
    brokerName: "Pedro Costa",
    superintendence: "Vendas Norte",
    board: "Marketing",
    leader: "Líder Epsilon",
    constructor: "MRV",
    appointmentDate: "2026-05-23",
    origin: "Indicação",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 13:30:00",
    clientName: "Rodrigo Hilbert",
    brokerName: "Ana Silva",
    superintendence: "Vendas Oeste",
    board: "Comercial",
    leader: "Líder Zeta",
    constructor: "Cyrela",
    appointmentDate: "2026-05-24",
    origin: "Stand de Vendas",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 13:45:00",
    clientName: "Grazi Massafera",
    brokerName: "Ana Silva",
    superintendence: "Vendas Oeste",
    board: "Comercial",
    leader: "Líder Zeta",
    constructor: "Moura Dubeux",
    appointmentDate: "2026-05-24",
    origin: "Lead Digital",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 14:00:00",
    clientName: "Cauã Reymond",
    brokerName: "Clara Nunes",
    superintendence: "Vendas Leste",
    board: "Novos Negócios",
    leader: "Líder Delta",
    constructor: "Plano & Plano",
    appointmentDate: "2026-05-25",
    origin: "Outros",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 14:15:00",
    clientName: "Paolla Oliveira",
    brokerName: "Raphael Damasceno",
    superintendence: "Hub On",
    board: "Tecnologia",
    leader: "Líder Alpha",
    constructor: "Hub On",
    appointmentDate: "2026-05-26",
    origin: "Instagram",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 14:30:00",
    clientName: "Vladimir Brichta",
    brokerName: "Ana Silva",
    superintendence: "Vendas Oeste",
    board: "Comercial",
    leader: "Líder Zeta",
    constructor: "Vertical Engenharia",
    appointmentDate: "2026-05-27",
    origin: "Carteira",
    isValidated: true
  },
  {
    timestamp: "2026-05-14 14:45:00",
    clientName: "Adriana Esteves",
    brokerName: "Ana Silva",
    superintendence: "Vendas Oeste",
    board: "Comercial",
    leader: "Líder Zeta",
    constructor: "Vertical Engenharia",
    appointmentDate: "2026-05-27",
    origin: "Lead Digital",
    isValidated: true
  }
];

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

    return parsed.length > 0 ? parsed : MOCK_DATA;
  } catch (error) {
    console.error('Error fetching appointments, using mock data:', error);
    return MOCK_DATA;
  }
}
