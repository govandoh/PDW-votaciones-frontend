import { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { getAllCampaigns } from '../../services/campaignService';
import { formatDateForDisplay } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { Campaign } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  // useState para manejar el estado de las campañas activas
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // useEffect para cargar los datos cuando el componente se monta
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        const campaigns = await getAllCampaigns();
        // Filtrar campañas activas
        const active = campaigns.filter(campaign => campaign.estado === 'activa');
        setActiveCampaigns(active);
        setError(null);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('No se pudieron cargar las campañas. Intente nuevamente más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <div className="dashboard-header mb-4">
        <h1>Bienvenido, {user?.nombres}</h1>
        <p className="lead">
          Este es el sistema de votación para la elección de la Junta Directiva del Colegio de Ingenieros de Guatemala.
        </p>
      </div>

      <h2 className="mb-3">Campañas activas</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {activeCampaigns.length === 0 ? (
        <Card className="text-center p-4">
          <Card.Body>
            <Card.Title>No hay campañas activas</Card.Title>
            <Card.Text>
              Actualmente no hay campañas de votación disponibles.
            </Card.Text>
            <Link to="/campaigns" className="btn btn-primary">Ver todas las campañas</Link>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {activeCampaigns.map((campaign) => (
            <Col md={4} key={campaign._id} className="mb-4">
              <Card className="h-100 campaign-card">
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{campaign.titulo}</h5>
                    <span className="badge bg-success">Activa</span>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Card.Text>
                    {campaign.descripcion.length > 100 
                      ? `${campaign.descripcion.substring(0, 100)}...` 
                      : campaign.descripcion}
                  </Card.Text>
                  <div className="d-flex flex-column gap-2 mt-3">
                    <small className="text-muted">
                      Votos por votante: {campaign.cantidadVotosPorVotante}
                    </small>
                    <small className="text-muted">
                      Período: {formatDateForDisplay(campaign.fechaInicio, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'America/Guatemala'
                      })} - {formatDateForDisplay(campaign.fechaFin, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'America/Guatemala'
                      })}
                    </small>
                    <Link to={`/campaigns/${campaign._id}`} className="btn btn-primary">
                      Participar
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div className="mt-4">
        <Link to="/campaigns" className="btn btn-outline-primary">
          Ver todas las campañas
        </Link>
      </div>
    </Container>
  );
};

export default DashboardPage;