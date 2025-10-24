import api from './api';
import { Candidate, CandidateFormValues } from '../types';

// Nota: Las imágenes ahora se manejan como rutas del proyecto
// La selección de imágenes se hace a través del componente ImageSelector

// Obtener todos los candidatos
export const getAllCandidates = async (): Promise<Candidate[]> => {
  try {
    const response = await api.get('/candidates');
    return response.data;
  } catch (error) {
    console.error('Error fetching all candidates:', error);
    throw error;
  }
};

// Obtener candidatos por campaña
export const getCandidatesByCampaign = async (campaignId: string): Promise<Candidate[]> => {
  try {
    const response = await api.get(`/candidates/campaign/${campaignId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener candidatos por campaña ${campaignId}:`, error);
    throw error;
  }
};

// Obtener un candidato por ID
export const getCandidateById = async (id: string): Promise<Candidate> => {
  try {
    const response = await api.get(`/candidates/${id}`);
    return response.data.candidate;
  } catch (error) {
    console.error(`Error al obtener candidato ${id}:`, error);
    throw error;
  }
};

// Crear un nuevo candidato
export const createCandidate = async (candidateData: CandidateFormValues): Promise<Candidate> => {
  try {
    // La foto ahora es una ruta de imagen del proyecto
    const requestData = {
      nombre: candidateData.nombre,
      descripcion: candidateData.descripcion,
      campañaId: candidateData.campañaId,
      foto: candidateData.foto || '' // Usar la ruta de la imagen seleccionada
    };
    
    const response = await api.post('/candidates', requestData);
    return response.data.candidate;
  } catch (error: any) {
    console.error('Error al crear candidato:', error);
    if (error.response?.data) {
      console.error('Detalles del error:', error.response.data);
    }
    throw error;
  }
};

// Actualizar un candidato existente
export const updateCandidate = async (id: string, candidateData: CandidateFormValues): Promise<Candidate> => {
  try {
    // Preparar los datos para actualizar
    const updateData = {
      nombre: candidateData.nombre,
      descripcion: candidateData.descripcion,
      campañaId: candidateData.campañaId,
      foto: candidateData.foto || '' // Usar la ruta de la imagen seleccionada
    };
    
    const response = await api.put(`/candidates/${id}`, updateData);
    return response.data.candidate;
  } catch (error) {
    console.error(`Error al actualizar candidato ${id}:`, error);
    throw error;
  }
};

// Eliminar un candidato
export const deleteCandidate = async (id: string): Promise<void> => {
  try {
    await api.delete(`/candidates/${id}`);
  } catch (error) {
    console.error(`Error al eliminar candidato ${id}:`, error);
    throw error;
  }
};