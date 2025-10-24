import api from './api';
import { VoteResult } from '../types';

// Emitir un voto
export const castVote = async (campaignId: string, candidateId: string): Promise<any> => {
  try {
    const response = await api.post('/votes', { 
      campaignId, 
      candidateId 
    });
    return response.data;
  } catch (error: any) {
    console.error('Error casting vote:', error);
    throw error;
  }
};

// Obtener los votos del usuario en una campaña específica
export const getUserVotes = async (campaignId: string): Promise<any> => {
  try {
    const response = await api.get(`/votes/user/campaign/${campaignId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user votes for campaign ${campaignId}:`, error);
    throw error;
  }
};

// Obtener resultados de una campaña
export const getCampaignResults = async (campaignId: string): Promise<VoteResult[]> => {
  try {
    const response = await api.get(`/votes/campaign/${campaignId}/results`);
    return response.data.results || [];
  } catch (error) {
    console.error(`Error fetching results for campaign ${campaignId}:`, error);
    throw error;
  }
};