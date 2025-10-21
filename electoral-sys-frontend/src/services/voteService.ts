import api from './api';

// Emitir un voto
export const castVote = async (campaignId: string, candidateId: string): Promise<any> => {
  const response = await api.post('/votes', { 
    campaignId, 
    candidateId 
  });
  
  return response.data;
};

// Obtener los votos del usuario en una campaña
export const getUserVotes = async (campaignId: string): Promise<any> => {
  const response = await api.get(`/votes/user/campaign/${campaignId}`);
  return response.data;
};

// Obtener resultados de una campaña
export const getCampaignResults = async (campaignId: string): Promise<any> => {
  const response = await api.get(`/votes/results/${campaignId}`);
  return response.data;
};