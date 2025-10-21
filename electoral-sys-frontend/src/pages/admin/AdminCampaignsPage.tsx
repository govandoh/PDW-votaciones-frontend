import { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getAllCampaigns, activateCampaign, deactivateCampaign } from '../../services/campaignService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Campaign } from '../../types';

const AdminCampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await getAllCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setError('Error al cargar las campañas');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaigns();
  }, []);
  
  // Función para activar una campaña
  const handleActivate = async (id: string) => {
    try {
      setActionLoading(id);
      // En un caso real, podrías mostrar un diálogo para pedir la duración
      const durationMinutes = 60; // 1 hora por defecto
      await activateCampaign(id, durationMinutes);
      
      // Actualizar la lista de campañas
      const updatedCampaigns = campaigns.map(campaign => {
        if (campaign._id === id) {
          return { ...campaign, estado: 'activa' as 'activa' | 'inactiva' | 'finalizada' };
        }
        return campaign;
      });
      
      setCampaigns(updatedCampaigns);
      setError(null);
    } catch (error) {
      console.error('Error activating campaign:', error);
      setError('No se pudo activar la campaña');
    } finally {
      setActionLoading(null);
    }
  };
  
  // Función para desactivar una campaña
  const handleDeactivate = async (id: string) => {
    try {
      setActionLoading(id);
      await deactivateCampaign(id);
      
      // Actualizar la lista de campañas
      const updatedCampaigns = campaigns.map(campaign => {
        if (campaign._id === id) {
          return { ...campaign, estado: 'inactiva' as 'activa' | 'inactiva' | 'finalizada' };
        }
        return campaign;
      });
      
      setCampaigns(updatedCampaigns);
      setError(null);
    } catch (error) {
      console.error('Error deactivating campaign:', error);
      setError('No se pudo desactivar la campaña');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Campañas</h1>
        <Link to="/admin/campaigns/create" className="text-decoration-none">
          <Button variant="primary">
            <i className="bi bi-plus-lg me-1"></i> Nueva Campaña
          </Button>
        </Link>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {campaigns.length === 0 ? (
        <Alert variant="info">
          No hay campañas registradas. Crea una nueva campaña para comenzar.
        </Alert>
      ) : (
        <Table responsive striped hover className="shadow-sm">
          <thead>
            <tr>
              <th>Título</th>
              <th>Estado</th>
              <th>Votos por Votante</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign._id}>
                <td>{campaign.titulo}</td>
                <td>
                  <Badge 
                    bg={
                      campaign.estado === 'activa' ? 'success' : 
                      campaign.estado === 'finalizada' ? 'info' : 'secondary'
                    }
                  >
                    {campaign.estado === 'activa' ? 'Activa' : 
                     campaign.estado === 'finalizada' ? 'Finalizada' : 'Inactiva'}
                  </Badge>
                </td>
                <td>{campaign.cantidadVotosPorVotante}</td>
                <td>{new Date(campaign.fechaInicio).toLocaleDateString()}</td>
                <td>{new Date(campaign.fechaFin).toLocaleDateString()}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Link 
                      to={`/admin/campaigns/edit/${campaign._id}`}
                      className="text-decoration-none"
                    >
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                      >
                        Editar
                      </Button>
                    </Link>
                    
                    {campaign.estado === 'inactiva' && (
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => handleActivate(campaign._id)}
                        disabled={actionLoading === campaign._id}
                      >
                        {actionLoading === campaign._id ? 'Activando...' : 'Activar'}
                      </Button>
                    )}
                    
                    {campaign.estado === 'activa' && (
                      <Button 
                        variant="outline-warning" 
                        size="sm"
                        onClick={() => handleDeactivate(campaign._id)}
                        disabled={actionLoading === campaign._id}
                      >
                        {actionLoading === campaign._id ? 'Desactivando...' : 'Desactivar'}
                      </Button>
                    )}
                    
                    <Link
                      to={`/admin/reports?campaignId=${campaign._id}`}
                      className="text-decoration-none"
                    >
                      <Button 
                        variant="outline-info" 
                        size="sm"
                      >
                        Reporte
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default AdminCampaignsPage;