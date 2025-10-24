import api from './api';
import { Candidate, CandidateFormValues } from '../types';

// URL del ícono por defecto de usuario
const DEFAULT_USER_ICON = 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png';

// Convertir archivo a Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

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
    console.log(`Candidatos obtenidos para campaña ${campaignId}:`, response.data);
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
    let fotoUrl = DEFAULT_USER_ICON;

    // Si hay una foto, convertirla a Base64
    if (candidateData.foto instanceof File) {
      try {
        fotoUrl = await fileToBase64(candidateData.foto);
      } catch (error) {
        console.error('Error al convertir la imagen:', error);
        // Si hay error al procesar la imagen, usar el ícono por defecto
        fotoUrl = DEFAULT_USER_ICON;
      }
    }

    // Preparar los datos para enviar
    const requestData = {
      nombre: candidateData.nombre,
      descripcion: candidateData.descripcion,
      campaña: candidateData.campañaId,
      foto: fotoUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Enviando datos del candidato:', {
      ...requestData,
      foto: requestData.foto.substring(0, 50) + '...' // Log parcial de la imagen para no saturar la consola
    });
    
    const response = await api.post('/candidates', requestData);

    console.log('Respuesta del servidor:', response.data);
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
    // Preparar los datos base para actualizar
    const updateData: any = {
      nombre: candidateData.nombre,
      descripcion: candidateData.descripcion,
      campaña: candidateData.campañaId,
      updatedAt: new Date().toISOString()
    };

    // Si hay una nueva foto, procesarla
    if (candidateData.foto instanceof File) {
      try {
        updateData.foto = await fileToBase64(candidateData.foto);
      } catch (error) {
        console.error('Error al convertir la imagen:', error);
        // En caso de error al procesar la imagen, no incluir el campo foto
        // para mantener la foto existente
      }
    }

    console.log(`Actualizando candidato ${id}:`, {
      ...updateData,
      foto: updateData.foto ? 'Imagen presente' : 'Sin cambios en la imagen'
    });
    
    const response = await api.put(`/candidates/${id}`, updateData);

    console.log('Respuesta del servidor:', response.data);
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
    console.log(`Candidato ${id} eliminado exitosamente`);
  } catch (error) {
    console.error(`Error al eliminar candidato ${id}:`, error);
    throw error;
  }
};