import { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  getAllCampaigns, 
  updateCampaignStatus
} from '../../services/campaignService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Campaign } from '../../types';

const AdminCampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Cargar campañas
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await getAllCampaigns();
        console.log("Campañas cargadas:", data);
        setCampaigns(data);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching campaigns:', error);
        setError('Error al cargar las campañas: ' + (error.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaigns();
  }, []);
  
  // Función para abrir el modal de activación
  const handleActivateClick = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    setShowActivateModal(true);
  };
  
  // Función para activar una campaña
  const handleActivate = async () => {
  if (!selectedCampaign) return;
  
  try {
    setActionLoading(selectedCampaign);
    
    // Llamar al servicio para actualizar el estado
    await updateCampaignStatus(selectedCampaign, 'activa');
    
    // CORRECCIÓN: Crear una copia explícita del array de campañas
    const updatedCampaigns = [...campaigns]; // Crea una copia del array
    
    // Buscar y actualizar la campaña específica
    const campaignIndex = updatedCampaigns.findIndex(c => c._id === selectedCampaign);
    if (campaignIndex !== -1) {
      updatedCampaigns[campaignIndex] = {
        ...updatedCampaigns[campaignIndex],
        estado: 'activa'
      };
    }
    
    // Actualizar el estado con la copia modificada
    setCampaigns(updatedCampaigns);
    
    setShowActivateModal(false);
    setSuccessMessage('Campaña activada exitosamente');
    
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  } catch (error: any) {
    console.error('Error activating campaign:', error);
    setError('No se pudo activar la campaña: ' + (error.message || 'Error desconocido'));
  } finally {
    setActionLoading(null);
  }
};
  
  // Función para finalizar una campaña
  const handleDeactivate = async (id: string) => {
  try {
    setActionLoading(id);
    
    // Llamar al servicio para actualizar el estado
    await updateCampaignStatus(id, 'finalizada');
    
    // CORRECCIÓN: Crear una copia explícita del array de campañas
    const updatedCampaigns = [...campaigns]; // Crea una copia del array
    
    // Buscar y actualizar la campaña específica
    const campaignIndex = updatedCampaigns.findIndex(c => c._id === id);
    if (campaignIndex !== -1) {
      updatedCampaigns[campaignIndex] = {
        ...updatedCampaigns[campaignIndex],
        estado: 'finalizada'
      };
    }
    
    // Actualizar el estado con la copia modificada
    setCampaigns(updatedCampaigns);
    
    setSuccessMessage('Campaña finalizada exitosamente');
    
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  } catch (error: any) {
    console.error('Error finalizing campaign:', error);
    setError('No se pudo finalizar la campaña: ' + (error.message || 'Error desconocido'));
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
        <Link to="/admin/campaigns/create" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i> Nueva Campaña
        </Link>
      </div>
      
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {successMessage && <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>{successMessage}</Alert>}
      
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
                      campaign.estado === 'finalizada' ? 'secondary' : 'warning'
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
                      className="btn btn-outline-primary btn-sm"
                    >
                      Editar
                    </Link>
                    
                    {campaign.estado === 'inactiva' && (
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => handleActivateClick(campaign._id)}
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
                        {actionLoading === campaign._id ? 'Finalizando...' : 'Finalizar'}
                      </Button>
                    )}
                    
                    <Link 
                      to={`/admin/reports?campaignId=${campaign._id}`}
                      className="btn btn-outline-info btn-sm"
                    >
                      Reporte
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      
      {/* Modal para activar campaña */}
      <Modal show={showActivateModal} onHide={() => setShowActivateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Activar Campaña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Está seguro que desea activar esta campaña?</p>
          <p>Una vez activada, los usuarios podrán votar en ella.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowActivateModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleActivate} disabled={actionLoading === selectedCampaign}>
            {actionLoading === selectedCampaign ? 'Activando...' : 'Activar Campaña'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminCampaignsPage;