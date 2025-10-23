import api from './api';
import { Campaign } from '../types';

// Obtener todas las campañas
export const getAllCampaigns = async (): Promise<Campaign[]> => {
  try {
    const response = await api.get('/campaigns');
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

// Obtener campaña por ID
export const getCampaignById = async (id: string) => {
  try {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching campaign ${id}:`, error);
    throw error;
  }
};

// Crear nueva campaña
export const createCampaign = async (campaignData: any) => {
  try {
    const response = await api.post('/campaigns', campaignData);
    return response.data;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

// Actualizar campaña existente
export const updateCampaign = async (id: string, campaignData: any) => {
  try {
    const response = await api.put(`/campaigns/${id}`, campaignData);
    return response.data;
  } catch (error) {
    console.error(`Error updating campaign ${id}:`, error);
    throw error;
  }
};

// Actualizar el estado de una campaña (activar, desactivar o finalizar)
export const updateCampaignStatus = async (id: string, estado: 'activa' | 'inactiva' | 'finalizada') => {
  try {
    console.log(`Actualizando estado de campaña ${id} a ${estado}`);
    
    // Llamada a la API utilizando el endpoint correcto
    const response = await api.patch(`/campaigns/${id}/estado`, { estado });
    
    console.log('Respuesta de actualización de estado:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating campaign status ${id}:`, error);
    throw error;
  }
};

// Activar una campaña (helper function que usa updateCampaignStatus)
export const activateCampaign = async (id: string) => {
  return updateCampaignStatus(id, 'activa');
};

// Desactivar una campaña (helper function que usa updateCampaignStatus)
export const deactivateCampaign = async (id: string) => {
  return updateCampaignStatus(id, 'finalizada');
};

// Generar reporte de campaña
export const generateCampaignReport = async (id: string) => {
  try {
    const response = await api.get(`/campaigns/${id}/report`);
    return response.data;
  } catch (error) {
    console.error(`Error generating report for campaign ${id}:`, error);
    throw error;
  }
};