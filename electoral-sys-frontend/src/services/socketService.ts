import { io, Socket } from 'socket.io-client';
import { getToken } from '../utils/auth';
import { VoteUpdate, CampaignStatusChange, TimeUpdate } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private activeRooms: string[] = [];

  // Conectar al servidor WebSocket
  connect(): void {
    const token = getToken();
    
    if (!token) {
      console.error('No token available for WebSocket connection');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token }
    });

    this.setupConnectionEvents();
  }

  // Configurar eventos de conexión
  private setupConnectionEvents(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      
      // Reconectar a salas activas
      this.activeRooms.forEach(campaignId => {
        this.joinCampaign(campaignId);
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
    });
  }

  // Unirse a la sala de una campaña
  joinCampaign(campaignId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected');
      // Guardar para reconexión
      if (!this.activeRooms.includes(campaignId)) {
        this.activeRooms.push(campaignId);
      }
      return;
    }
    
    this.socket.emit('joinCampaign', campaignId);
    console.log(`Joined campaign room: ${campaignId}`);
    
    // Guardar sala activa
    if (!this.activeRooms.includes(campaignId)) {
      this.activeRooms.push(campaignId);
    }
  }

  // Salir de la sala de una campaña
  leaveCampaign(campaignId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected');
    } else {
      this.socket.emit('leaveCampaign', campaignId);
      console.log(`Left campaign room: ${campaignId}`);
    }
    
    // Remover de salas activas
    this.activeRooms = this.activeRooms.filter(id => id !== campaignId);
  }

  // Suscribirse a actualizaciones de votos
  onVoteUpdate(callback: (data: VoteUpdate) => void): () => void {
    if (!this.socket) return () => {};
    
    this.socket.on('voteUpdate', callback);
    
    // Retornar función para cancelar la suscripción
    return () => {
      this.socket?.off('voteUpdate', callback);
    };
  }

  // Suscribirse a cambios de estado de campaña
  onCampaignStatusChange(callback: (data: CampaignStatusChange) => void): () => void {
    if (!this.socket) return () => {};
    
    this.socket.on('campaignStatusChange', callback);
    
    // Retornar función para cancelar la suscripción
    return () => {
      this.socket?.off('campaignStatusChange', callback);
    };
  }

  // Suscribirse a actualizaciones de tiempo
  onTimeUpdate(callback: (data: TimeUpdate) => void): () => void {
    if (!this.socket) return () => {};
    
    this.socket.on('timeUpdate', callback);
    
    // Retornar función para cancelar la suscripción
    return () => {
      this.socket?.off('timeUpdate', callback);
    };
  }

  // Desconectar del servidor
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Disconnected from WebSocket server');
    }
  }

  // Verificar si está conectado
  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }
}

// Instancia singleton
export const socketService = new SocketService();
export default socketService;