import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getAllCampaigns } from '../../services/campaignService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Campaign } from '../../types';

const CampaignsPage = () => {
  // Estados con useState
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // useCallback para memoizar la función de filtrado
  const filterCampaigns = useCallback(() => {
    let result = [...campaigns];
    
    // Filtrar por estado
    if (filterStatus !== 'all') {
      result = result.filter(campaign => campaign.estado === filterStatus);
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(campaign => 
        campaign.titulo.toLowerCase().includes(term) || 
        campaign.descripcion.toLowerCase().includes(term)
      );
    }
    
    setFilteredCampaigns(result);
  }, [campaigns, filterStatus, searchTerm]);

  // useEffect para cargar los datos al montar el componente
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await getAllCampaigns();
        setCampaigns(data);
        setFilteredCampaigns(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setError('No se pudieron cargar las campañas. Por favor, intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // useEffect para aplicar filtros cuando cambian los criterios
  useEffect(() => {
    filterCampaigns();
  }, [filterCampaigns]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <h1 className="mb-4">Campañas Electorales</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Filtros */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Filtrar por estado:</Form.Label>
                <Form.Select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Todas las campañas</option>
                  <option value="activa">Campañas activas</option>
                  <option value="inactiva">Campañas inactivas</option>
                  <option value="completada">Campañas completadas</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Buscar:</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Buscar campañas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Lista de campañas */}
      {filteredCampaigns.length === 0 ? (
        <div className="alert alert-info">
          No se encontraron campañas que coincidan con los criterios de búsqueda.
        </div>
      ) : (
        <Row>
          {filteredCampaigns.map(campaign => (
            <Col key={campaign._id} md={6} lg={4} className="mb-4">
              <Card className="h-100 campaign-card">
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{campaign.titulo}</h5>
                    <Badge 
                      bg={
                        campaign.estado === 'activa' ? 'success' : 
                        campaign.estado === 'finalizada' ? 'primary' : 
                        'secondary'
                      }
                    >
                      {campaign.estado === 'activa' ? 'Activa' : 
                       campaign.estado === 'finalizada' ? 'Finalizada' : 
                       'Inactiva'}
                    </Badge>
                  </div>
                </Card.Header>
                
                <Card.Body>
                  <Card.Text>
                    {campaign.descripcion.length > 150 
                      ? `${campaign.descripcion.substring(0, 150)}...` 
                      : campaign.descripcion}
                  </Card.Text>
                  
                  <div className="mt-3">
                    <small className="text-muted d-block mb-2">
                      Votos por votante: {campaign.cantidadVotosPorVotante}
                    </small>
                    
                    <small className="text-muted d-block mb-3">
                      Período: {new Date(campaign.fechaInicio).toLocaleDateString()} - 
                      {new Date(campaign.fechaFin).toLocaleDateString()}
                    </small>
                  </div>
                </Card.Body>
                
                <Card.Footer className="bg-white">
                  <Link to={`/campaigns/${campaign._id}`} className="text-decoration-none w-100">
                    <Button 
                      variant="primary"
                      className="w-100"
                    >
                      Ver detalles
                    </Button>
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default CampaignsPage;