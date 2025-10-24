import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getAllCampaigns } from '../../services/campaignService';
import { Campaign } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboardPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estadísticas calculadas
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    inactiveCampaigns: 0,
    completedCampaigns: 0
  });
  
  // useEffect para cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const campaignsData = await getAllCampaigns();
        setCampaigns(campaignsData);
        
        // Calcular estadísticas
        setStats({
          totalCampaigns: campaignsData.length,
          activeCampaigns: campaignsData.filter(c => c.estado === 'activa').length,
          inactiveCampaigns: campaignsData.filter(c => c.estado === 'inactiva').length,
          completedCampaigns: campaignsData.filter(c => c.estado === 'finalizada').length
        });
        
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <div className="dashboard-header">
        <h1>Panel de Administración</h1>
        <p className="lead">
          Gestione las campañas electorales, candidatos y revise los resultados de las votaciones.
        </p>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Estadísticas */}
      <h2 className="mb-3">Resumen</h2>
      <Row className="dashboard-stats mb-4">
        <Col md={3} className="mb-3">
          <Card className="stat-card bg-light">
            <div className="d-flex justify-content-between">
              <div>
                <p className="stat-title">Total de Campañas</p>
                <h3 className="stat-value">{stats.totalCampaigns}</h3>
              </div>
              <div className="stat-icon">
                <i className="bi bi-collection"></i>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="stat-card bg-success bg-opacity-10">
            <div className="d-flex justify-content-between">
              <div>
                <p className="stat-title">Campañas Activas</p>
                <h3 className="stat-value">{stats.activeCampaigns}</h3>
              </div>
              <div className="stat-icon text-success">
                <i className="bi bi-play-circle"></i>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="stat-card bg-warning bg-opacity-10">
            <div className="d-flex justify-content-between">
              <div>
                <p className="stat-title">Campañas Inactivas</p>
                <h3 className="stat-value">{stats.inactiveCampaigns}</h3>
              </div>
              <div className="stat-icon text-warning">
                <i className="bi bi-pause-circle"></i>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="stat-card bg-info bg-opacity-10">
            <div className="d-flex justify-content-between">
              <div>
                <p className="stat-title">Campañas Completadas</p>
                <h3 className="stat-value">{stats.completedCampaigns}</h3>
              </div>
              <div className="stat-icon text-info">
                <i className="bi bi-check-circle"></i>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* Acciones Rápidas */}
      <h2 className="mb-3">Acciones Rápidas</h2>
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Link to="/admin/campaigns/create" className="text-decoration-none w-100">
            <Button 
              variant="primary" 
              className="w-100 p-3"
            >
              <i className="bi bi-plus-lg me-2"></i>
              Nueva Campaña
            </Button>
          </Link>
        </Col>
        
        <Col md={3} className="mb-3">
          <Link to="/admin/candidates/create" className="text-decoration-none w-100">
            <Button 
              variant="success" 
              className="w-100 p-3"
            >
              <i className="bi bi-person-plus me-2"></i>
              Nuevo Candidato
            </Button>
          </Link>
        </Col>
        
        <Col md={3} className="mb-3">
          <Link to="/admin/campaigns" className="text-decoration-none w-100">
            <Button 
              variant="info" 
              className="w-100 p-3"
            >
              <i className="bi bi-list-check me-2"></i>
              Ver Campañas
            </Button>
          </Link>
        </Col>
        
        <Col md={3} className="mb-3">
          <Link to="/admin/reports" className="text-decoration-none w-100">
            <Button 
              variant="secondary" 
              className="w-100 p-3"
            >
              <i className="bi bi-bar-chart me-2"></i>
              Ver Reportes
            </Button>
          </Link>
        </Col>
      </Row>
      
      {/* Campañas Recientes */}
      <h2 className="mb-3">Campañas Recientes</h2>
      <Row>
        {campaigns.length === 0 ? (
          <Col>
            <div className="alert alert-info">
              No hay campañas disponibles.
            </div>
          </Col>
        ) : (
          campaigns.slice(0, 3).map(campaign => (
            <Col key={campaign._id} md={4} className="mb-4">
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{campaign.titulo}</h5>
                  <span className={`badge bg-${
                    campaign.estado === 'activa' ? 'success' : 
                    campaign.estado === 'finalizada' ? 'info' : 'secondary'
                  }`}>
                    {campaign.estado === 'activa' ? 'Activa' : 
                     campaign.estado === 'finalizada' ? 'Finalizada' : 'Inactiva'}
                  </span>
                </Card.Header>
                <Card.Body>
                  <Card.Text>
                    {campaign.descripcion.substring(0, 100)}...
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between align-items-center bg-white">
                  <small className="text-muted">
                    Creada: {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 'Sin fecha'}
                  </small>
                  <Link 
                    to={`/admin/campaigns/edit/${campaign._id}`}
                    className="text-decoration-none"
                  >
                    <Button 
                      variant="outline-primary"
                      size="sm"
                    >
                      Gestionar
                    </Button>
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          ))
        )}
      </Row>
      
      {campaigns.length > 3 && (
        <div className="text-center mt-3 mb-5">
          <Link to="/admin/campaigns" className="text-decoration-none">
            <Button 
              variant="outline-primary"
            >
              Ver todas las campañas
            </Button>
          </Link>
        </div>
      )}
    </Container>
  );
};

export default AdminDashboardPage;