import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getCandidatesByCampaign, deleteCandidate } from '../../services/candidateService';
import { getAllCampaigns } from '../../services/campaignService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Candidate, Campaign } from '../../types';

const AdminCandidatesPage = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [candidatesLoading, setCandidatesLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);

  // Cargar campañas
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const campaignsData = await getAllCampaigns();
        setCampaigns(campaignsData);
        
        if (campaignsData.length > 0) {
          setSelectedCampaignId(campaignsData[0]._id);
        }
      } catch (error: any) {
        console.error('Error fetching campaigns:', error);
        setError(error.message || 'Error al cargar las campañas');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaigns();
  }, []);

  // Cargar candidatos cuando cambia la campaña seleccionada
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!selectedCampaignId) return;
      
      try {
        setCandidatesLoading(true);
        const data = await getCandidatesByCampaign(selectedCampaignId);
        setCandidates(data);
      } catch (error: any) {
        console.error('Error fetching candidates:', error);
        setError(error.message || 'Error al cargar los candidatos');
      } finally {
        setCandidatesLoading(false);
      }
    };
    
    if (selectedCampaignId) {
      fetchCandidates();
    }
  }, [selectedCampaignId]);

  const handleCampaignChange = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setError(null);
  };

  const handleDeleteClick = (candidateId: string) => {
    setCandidateToDelete(candidateId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!candidateToDelete) return;

    try {
      await deleteCandidate(candidateToDelete);
      
      // Actualizar la lista de candidatos
      setCandidates(candidates.filter(c => c._id !== candidateToDelete));
      
      setSuccessMessage('Candidato eliminado exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(error.message || 'Error al eliminar el candidato');
    } finally {
      setShowDeleteModal(false);
      setCandidateToDelete(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const selectedCampaign = campaigns.find(c => c._id === selectedCampaignId);

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Candidatos</h1>
        <Link to="/admin/candidates/create" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i> Nuevo Candidato
        </Link>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {campaigns.length === 0 ? (
        <Alert variant="info">
          No hay campañas disponibles. Cree una campaña antes de agregar candidatos.
        </Alert>
      ) : (
        <>
          {/* Selector de Campañas */}
          <div className="mb-4">
            <h2 className="h5 mb-3">Seleccione una campaña:</h2>
            <Row>
              {campaigns.map(campaign => (
                <Col key={campaign._id} md={4} lg={3} className="mb-3">
                  <Card 
                    className={`campaign-selector ${selectedCampaignId === campaign._id ? 'border-primary' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCampaignChange(campaign._id)}
                  >
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0" style={{ fontSize: '1rem' }}>{campaign.titulo}</h5>
                        {selectedCampaignId === campaign._id && (
                          <i className="bi bi-check-circle-fill text-primary"></i>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Lista de Candidatos */}
          {selectedCampaignId && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Candidatos para: {selectedCampaign?.titulo}</h2>
                <Link 
                  to={`/admin/candidates/create?campaignId=${selectedCampaignId}`}
                  className="btn btn-success btn-sm"
                >
                  <i className="bi bi-plus-lg me-1"></i> Agregar Candidato a esta Campaña
                </Link>
              </div>

              {candidatesLoading ? (
                <LoadingSpinner />
              ) : candidates.length === 0 ? (
                <Alert variant="info">
                  No hay candidatos registrados para esta campaña.
                </Alert>
              ) : (
                <Row>
                  {candidates.map(candidate => (
                    <Col key={candidate._id} md={6} lg={4} className="mb-4">
                      <Card className="h-100 candidate-card shadow-sm">
                        <div style={{ height: '200px', overflow: 'hidden' }}>
                          <Card.Img 
                            variant="top" 
                            src={candidate.foto || 'https://via.placeholder.com/300x200?text=Candidato'}
                            className="candidate-image"
                            alt={candidate.nombre}
                            style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                          />
                        </div>
                        <Card.Body>
                          <Card.Title>{candidate.nombre}</Card.Title>
                          <Card.Text>{candidate.descripcion}</Card.Text>
                        </Card.Body>
                        <Card.Footer className="bg-white">
                          <div className="d-flex justify-content-between">
                            <Link 
                              to={`/admin/candidates/edit/${candidate._id}`}
                              className="btn btn-outline-primary btn-sm"
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Editar
                            </Link>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDeleteClick(candidate._id)}
                            >
                              <i className="bi bi-trash me-1"></i>
                              Eliminar
                            </Button>
                          </div>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </>
          )}
        </>
      )}

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro que desea eliminar este candidato? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminCandidatesPage;