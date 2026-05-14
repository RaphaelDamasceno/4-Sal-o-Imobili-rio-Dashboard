export interface Appointment {
  timestamp: string;
  clientName: string;
  brokerName: string;
  superintendence: string;
  board: string;
  leader: string;
  constructor: string;
  appointmentDate: string;
  origin: string;
  isValidated: boolean;
}

export interface Stats {
  total: number;
  validated: number;
  byBroker: Record<string, number>;
  byConstructor: Record<string, number>;
}
