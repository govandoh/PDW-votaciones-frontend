import api from './api';
import { Candidate, CandidateFormValues } from '../types';

// Obtener candidatos por campaña
export const getCandidatesByCampaign = async (campaignId: string): Promise<Candidate[]> => {
  const response = await api.get<Candidate[]>(`/candidates/campaign/${campaignId}`);
  return response.data;
};

// Crear un nuevo candidato
export const createCandidate = async (candidateData: CandidateFormValues): Promise<Candidate> => {
  // Crear FormData para enviar archivos
  const formData = new FormData();
  formData.append('nombre', candidateData.nombre);
  formData.append('descripcion', candidateData.descripcion);
  formData.append('campañaId', candidateData.campañaId);
  
  if (candidateData.foto) {
    formData.append('foto', candidateData.foto);
  }
  
  const response = await api.post<{message: string, candidate: Candidate}>(
    '/candidates', 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  
  return response.data.candidate;
};

// Actualizar un candidato existente
export const updateCandidate = async (id: string, candidateData: CandidateFormValues): Promise<Candidate> => {
  // Crear FormData para enviar archivos
  const formData = new FormData();
  formData.append('nombre', candidateData.nombre);
  formData.append('descripcion', candidateData.descripcion);
  formData.append('campañaId', candidateData.campañaId);
  
  if (candidateData.foto) {
    formData.append('foto', candidateData.foto);
  }
  
  const response = await api.put<{message: string, candidate: Candidate}>(
    `/candidates/${id}`, 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  
  return response.data.candidate;
};

// Eliminar un candidato
export const deleteCandidate = async (id: string): Promise<void> => {
  await api.delete(`/candidates/${id}`);
};