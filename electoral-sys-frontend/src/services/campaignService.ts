import api from './api';
import { Campaign, CampaignFormValues } from '../types';

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

// Obtener una campaña por ID con detalles completos
export const getCampaignById = async (id: string): Promise<any> => {
  try {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching campaign ${id}:`, error);
    throw error;
  }
};

// Crear una nueva campaña
export const createCampaign = async (campaignData: CampaignFormValues): Promise<Campaign> => {
  try {
    const response = await api.post('/campaigns', {
      titulo: campaignData.titulo,
      descripcion: campaignData.descripcion,
      votosPorVotante: campaignData.cantidadVotosPorVotante,
      fechaInicio: campaignData.fechaInicio,
      fechaFin: campaignData.fechaFin
    });
    return response.data.campaign;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

// Actualizar una campaña existente
export const updateCampaign = async (id: string, campaignData: Partial<CampaignFormValues>): Promise<Campaign> => {
  try {
    const updateData: any = {};
    
    if (campaignData.titulo) updateData.titulo = campaignData.titulo;
    if (campaignData.descripcion) updateData.descripcion = campaignData.descripcion;
    if (campaignData.cantidadVotosPorVotante) updateData.votosPorVotante = campaignData.cantidadVotosPorVotante;
    if (campaignData.fechaInicio) updateData.fechaInicio = campaignData.fechaInicio;
    if (campaignData.fechaFin) updateData.fechaFin = campaignData.fechaFin;
    
    const response = await api.put(`/campaigns/${id}`, updateData);
    return response.data.campaign;
  } catch (error) {
    console.error(`Error updating campaign ${id}:`, error);
    throw error;
  }
};

// Actualizar el estado de una campaña
export const updateCampaignStatus = async (id: string, estado: 'activa' | 'inactiva' | 'finalizada'): Promise<Campaign> => {
  try {
    const response = await api.patch(`/campaigns/${id}/estado`, { estado });
    return response.data.campaign;
  } catch (error) {
    console.error(`Error updating campaign status ${id}:`, error);
    throw error;
  }
};

// Eliminar una campaña
export const deleteCampaign = async (id: string): Promise<void> => {
  try {
    await api.delete(`/campaigns/${id}`);
  } catch (error) {
    console.error(`Error deleting campaign ${id}:`, error);
    throw error;
  }
};

// Generar reporte de una campaña
export const generateCampaignReport = async (id: string): Promise<any> => {
  try {
    const response = await api.get(`/campaigns/${id}/report`);
    return response.data;
  } catch (error) {
    console.error(`Error generating report for campaign ${id}:`, error);
    throw error;
  }
};