// Modelos de datos
export interface User {
  id: string;
  numeroColegiado: string;
  nombres: string;
  apellidos: string;
  correo: string;
  dpi: string;
  fechaNacimiento: string;
  role: 'admin' | 'votante';
}

export interface Campaign {
  _id: string;
  titulo: string;
  descripcion: string;
  cantidadVotosPorVotante: number;
  fechaInicio: string;
  fechaFin: string;
  estado: 'activa' | 'inactiva' | 'finalizada'; // Importante: debe coincidir con los estados del backend
  createdAt?: string;
  updatedAt?: string;
}

export interface Candidate {
  _id: string;
  nombre: string;
  descripcion: string;
  foto: string;
  campaña: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  _id: string;
  votante: string;
  campaña: string;
  candidato: string;
  createdAt: string;
}

export interface VoteResult {
  candidateId: string;
  candidateName: string;
  votes: number;
  percentage?: string;
}

export interface CampaignDetail {
  campaign: Campaign;
  candidates: Candidate[];
  votesRemaining: number;
  votesUsed: number;
  results: VoteResult[];
}

// Tipos para WebSocket
export interface VoteUpdate {
  campaignId: string;
  results: VoteResult[];
  timestamp: string;
}

export interface CampaignStatusChange {
  campaignId: string;
  isActive: boolean;
}

export interface TimeUpdate {
  campaignId: string;
  remainingTime: number;
}

// Tipos para formularios
export interface LoginFormValues {
  numeroColegiado: string;
  dpi: string;
  fechaNacimiento: string;
  password: string;
}

export interface RegisterFormValues {
  numeroColegiado: string;
  nombres: string;
  apellidos: string;
  correo: string;
  dpi: string;
  fechaNacimiento: string;
  password: string;
  confirmPassword: string;
}

export interface CampaignFormValues {
  titulo: string;
  descripcion: string;
  cantidadVotosPorVotante: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface CandidateFormValues {
  nombre: string;
  descripcion: string;
  foto: File | null;
  campañaId: string;
}