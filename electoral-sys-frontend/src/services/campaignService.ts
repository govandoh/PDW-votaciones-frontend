import api from './api';
import { Campaign, CampaignDetail, CampaignFormValues } from '../types';

// Obtener todas las campañas
export const getAllCampaigns = async (): Promise<Campaign[]> => {
  const response = await api.get<Campaign[]>('/campaigns');
  return response.data;
};

// Obtener una campaña por su ID
export const getCampaignById = async (id: string): Promise<CampaignDetail> => {
  const response = await api.get<CampaignDetail>(`/campaigns/${id}`);
  return response.data;
};

// Crear una nueva campaña
export const createCampaign = async (campaignData: CampaignFormValues): Promise<Campaign> => {
  const response = await api.post<{message: string, campaign: Campaign}>('/campaigns', campaignData);
  return response.data.campaign;
};

// Actualizar una campaña existente
export const updateCampaign = async (id: string, campaignData: Partial<CampaignFormValues>): Promise<Campaign> => {
  const response = await api.put<{message: string, campaign: Campaign}>(`/campaigns/${id}`, campaignData);
  return response.data.campaign;
};

// Eliminar una campaña
export const deleteCampaign = async (id: string): Promise<void> => {
  await api.delete(`/campaigns/${id}`);
};

// Activar una campaña
export const activateCampaign = async (id: string, durationMinutes: number): Promise<Campaign> => {
  const response = await api.post<{message: string, campaign: Campaign}>(`/campaigns/${id}/activate`, { duration: durationMinutes });
  return response.data.campaign;
};

// Desactivar una campaña
export const deactivateCampaign = async (id: string): Promise<Campaign> => {
  const response = await api.post<{message: string, campaign: Campaign}>(`/campaigns/${id}/deactivate`);
  return response.data.campaign;
};

// Generar reporte de una campaña
export const generateCampaignReport = async (id: string): Promise<any> => {
  const response = await api.get(`/campaigns/${id}/report`);
  return response.data;
};