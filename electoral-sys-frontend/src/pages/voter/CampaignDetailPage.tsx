import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Alert, ProgressBar } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { getCampaignById } from '../../services/campaignService';
import { castVote } from '../../services/voteService';
import socketService from '../../services/socketService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getCandidateImageByFileName } from '../../config/candidateImages';
import { CampaignDetail, VoteResult } from '../../types';
import { formatDateForDisplay, calculateRemainingSeconds, formatRemainingTime } from '../../utils/dateUtils';

// Registrar componentes de ChartJS
ChartJS.register(ArcElement, Tooltip, Legend);

const CampaignDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estados
  const [campaignDetail, setCampaignDetail] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [votesRemaining, setVotesRemaining] = useState<number>(0);
  const [voteSuccess, setVoteSuccess] = useState<string | null>(null);
  const [votingInProgress, setVotingInProgress] = useState<boolean>(false);
  
  // useRef para cleanup de sockets
  const socketCleanupRef = useRef<(() => void)[]>([]);
  const timerRef = useRef<number | null>(null);
  
  // Calcular tiempo restante basado en fechas de la campaña
  useEffect(() => {
    if (!campaignDetail) return;
    
    const calculateAndUpdateRemainingTime = () => {
      const now = new Date();
      const endDate = new Date(campaignDetail.campaign.fechaFin);
      const startDate = new Date(campaignDetail.campaign.fechaInicio);
      
      // Si la campaña no ha comenzado
      if (now < startDate) {
        setRemainingTime(null);
        return null;
      }
      
      // Calcular segundos restantes
      const remaining = calculateRemainingSeconds(campaignDetail.campaign.fechaFin);
      setRemainingTime(remaining);
      
      return remaining;
    };
    
    // Calcular inmediatamente
    const remaining = calculateAndUpdateRemainingTime();
    
    // Actualizar cada segundo si la campaña está activa
    if (isActive && remaining !== null && remaining > 0) {
      timerRef.current = window.setInterval(() => {
        const newRemaining = calculateAndUpdateRemainingTime();
        
        // Si el tiempo se acabó, detener el timer
        if (newRemaining !== null && newRemaining <= 0) {
          setIsActive(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        }
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [campaignDetail, isActive]);
  
  // Función para votar
  const handleVote = useCallback(async (candidateId: string) => {
    if (!id || votingInProgress) return;
    
    try {
      setVotingInProgress(true);
      setError(null);
      setVoteSuccess(null);
      
      await castVote(id, candidateId);
      
      // Actualizar votos restantes
      setVotesRemaining(prev => Math.max(0, prev - 1));
      setVoteSuccess("¡Voto registrado exitosamente!");
      
      // Recargar datos de la campaña
      const data = await getCampaignById(id);
      setCampaignDetail(data);
      setVotesRemaining(data.votesRemaining);
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setVoteSuccess(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error casting vote:', error);
      const errorMessage = error.response?.data?.message || 'Error al emitir el voto';
      setError(errorMessage);
    } finally {
      setVotingInProgress(false);
    }
  }, [id, votingInProgress]);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getCampaignById(id);
        
        console.log('Campaign data loaded:', data);
        
        setCampaignDetail(data);
        setIsActive(data.campaign.estado === 'activa');
        setVotesRemaining(data.votesRemaining);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching campaign details:', error);
        setError(error.response?.data?.message || 'No se pudo cargar la información de la campaña');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [id]);

  // Configurar WebSocket
  useEffect(() => {
    if (!id || !campaignDetail) return;
    
    // Conectar socket si no está conectado
    if (!socketService.isConnected()) {
      socketService.connect();
    }
    
    // Unirse a la sala de la campaña
    socketService.joinCampaign(id);
    
    // Suscribirse a actualizaciones de votos
    const voteUpdateCleanup = socketService.onVoteUpdate(data => {
      if (data.campaignId === id && campaignDetail) {
        console.log('Vote update received:', data);
        setCampaignDetail(prev => prev ? {
          ...prev,
          results: data.results
        } : null);
      }
    });
    
    // Suscribirse a cambios de estado
    const statusChangeCleanup = socketService.onCampaignStatusChange(data => {
      if (data.campaignId === id) {
        console.log('Status change received:', data);
        setIsActive(data.isActive);
      }
    });
    
    // Suscribirse a actualizaciones de tiempo
    const timeUpdateCleanup = socketService.onTimeUpdate(data => {
      if (data.campaignId === id) {
        console.log('Time update received:', data);
        setRemainingTime(data.remainingTime);
      }
    });
    
    // Guardar cleanup functions
    socketCleanupRef.current = [voteUpdateCleanup, statusChangeCleanup, timeUpdateCleanup];
    
    // Cleanup
    return () => {
      socketService.leaveCampaign(id);
      socketCleanupRef.current.forEach(cleanup => cleanup());
    };
  }, [id, campaignDetail]);

  // Preparar datos para el gráfico
  const chartData = campaignDetail ? {
    labels: campaignDetail.results.map(r => r.candidateName),
    datasets: [
      {
        label: 'Votos',
        data: campaignDetail.results.map(r => r.votes),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
        ],
        borderWidth: 2,
      },
    ],
  } : null;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!campaignDetail) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <Alert.Heading>Campaña no encontrada</Alert.Heading>
          <p>No se encontró la campaña solicitada o ocurrió un error al cargarla.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button onClick={() => navigate('/campaigns')} variant="outline-warning">
              Ver todas las campañas
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const totalVotes = campaignDetail.results.reduce((sum, r) => sum + r.votes, 0);
  const votePercentage = campaignDetail.campaign.cantidadVotosPorVotante > 0 
    ? (campaignDetail.votesUsed / campaignDetail.campaign.cantidadVotosPorVotante) * 100 
    : 0;

  return (
    <Container className="campaign-detail py-4">
      {/* Header */}
      <div className="voting-header mb-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h1 className="campaign-title mb-2">{campaignDetail.campaign.titulo}</h1>
            <p className="campaign-description lead text-muted">{campaignDetail.campaign.descripcion}</p>
            
            {/* Información de fechas */}
            <div className="text-muted small mt-2">
              <div>
                <i className="bi bi-calendar-event me-2"></i>
                <strong>Inicio:</strong> {formatDateForDisplay(campaignDetail.campaign.fechaInicio, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'America/Guatemala'
                })} (Hora de Guatemala)
              </div>
              <div className="mt-1">
                <i className="bi bi-calendar-check me-2"></i>
                <strong>Finaliza:</strong> {formatDateForDisplay(campaignDetail.campaign.fechaFin, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'America/Guatemala'
                })} (Hora de Guatemala)
              </div>
            </div>
          </div>
          <Badge 
            bg={isActive ? 'success' : 'secondary'}
            className="campaign-status py-2 px-3 fs-6"
          >
            {isActive ? '🟢 Votación Activa' : '⚫ Votación Inactiva'}
          </Badge>
        </div>
        
        {/* Info Cards */}
        <Row className="mb-4">
          {/* Timer */}
          {remainingTime !== null && (
            <Col md={4} className="mb-3">
              <Card className={`h-100 ${isActive ? 'border-success' : 'border-secondary'}`}>
                <Card.Body>
                  <h6 className="text-muted mb-2">
                    <i className="bi bi-clock-history me-2"></i>
                    Tiempo restante
                  </h6>
                  <h3 className={`mb-0 ${isActive ? 'text-success' : 'text-secondary'}`}>
                    {formatRemainingTime(remainingTime)}
                  </h3>
                  {remainingTime > 0 && (
                    <small className="text-muted">
                      hasta el {formatDateForDisplay(campaignDetail.campaign.fechaFin, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'America/Guatemala'
                      })}
                    </small>
                  )}
                </Card.Body>
              </Card>
            </Col>
          )}
          
          {/* Votos disponibles */}
          <Col md={4} className="mb-3">
            <Card className="h-100 border-primary">
              <Card.Body>
                <h6 className="text-muted mb-2">
                  <i className="bi bi-hand-thumbs-up me-2"></i>
                  Votos disponibles
                </h6>
                <h3 className="mb-2 text-primary">
                  {votesRemaining} <span className="fs-6 text-muted">de {campaignDetail.campaign.cantidadVotosPorVotante}</span>
                </h3>
                <ProgressBar 
                  now={votePercentage} 
                  variant={votePercentage === 100 ? 'success' : 'primary'}
                  style={{ height: '8px' }}
                />
              </Card.Body>
            </Card>
          </Col>
          
          {/* Total de votos en la campaña */}
          <Col md={4} className="mb-3">
            <Card className="h-100 border-info">
              <Card.Body>
                <h6 className="text-muted mb-2">
                  <i className="bi bi-bar-chart me-2"></i>
                  Total de votos
                </h6>
                <h3 className="mb-0 text-info">{totalVotes}</h3>
                <small className="text-muted">votos emitidos en esta campaña</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Alertas */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <span>{error}</span>
          </Alert>
        )}
        
        {voteSuccess && (
          <Alert variant="success" dismissible onClose={() => setVoteSuccess(null)} className="d-flex align-items-center">
            <i className="bi bi-check-circle-fill me-2"></i>
            <span>{voteSuccess}</span>
          </Alert>
        )}
        
        {!isActive && (
          <Alert variant="warning" className="d-flex align-items-center">
            <i className="bi bi-info-circle-fill me-2"></i>
            <span>Esta campaña no está activa. No es posible votar en este momento.</span>
          </Alert>
        )}
        
        {votesRemaining === 0 && isActive && (
          <Alert variant="info" className="d-flex align-items-center">
            <i className="bi bi-check-circle-fill me-2"></i>
            <span>Has utilizado todos tus votos disponibles para esta campaña.</span>
          </Alert>
        )}
      </div>

      <Row>
        {/* Lista de Candidatos */}
        <Col lg={8} className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 mb-0">Candidatos</h2>
            <Badge bg="secondary">{campaignDetail.candidates.length} candidatos</Badge>
          </div>
          
          {campaignDetail.candidates.length === 0 ? (
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              No hay candidatos registrados en esta campaña.
            </Alert>
          ) : (
            <Row>
              {campaignDetail.candidates.map(candidate => {
                const candidateResult = campaignDetail.results.find(
                  r => r.candidateId === candidate._id
                );
                const votes = candidateResult ? candidateResult.votes : 0;
                const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0.0';
                
                return (
                  <Col key={candidate._id} md={6} className="mb-3">
                    <Card className="h-100 candidate-card shadow-sm">
                      <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                        <Card.Img 
                          variant="top" 
                          src={getCandidateImageByFileName(candidate.foto || 'default')}
                          className="candidate-image"
                          alt={candidate.nombre}
                          style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                        />
                      </div>
                      <Card.Body>
                        <Card.Title className="mb-2">{candidate.nombre}</Card.Title>
                        <Card.Text className="text-muted small mb-3">
                          {candidate.descripcion}
                        </Card.Text>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-primary fw-bold">
                            <i className="bi bi-graph-up me-1"></i>
                            {votes} votos
                          </span>
                          <Badge bg="light" text="dark">{percentage}%</Badge>
                        </div>
                      </Card.Body>
                      <Card.Footer className="bg-white border-top">
                        <Button 
                          variant={votesRemaining > 0 && isActive ? 'primary' : 'secondary'}
                          className="w-100 btn-vote" 
                          onClick={() => handleVote(candidate._id)}
                          disabled={!isActive || votesRemaining <= 0 || votingInProgress}
                        >
                          {votingInProgress ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Votando...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-hand-thumbs-up me-2"></i>
                              {votesRemaining > 0 && isActive ? 'Votar' : 'No disponible'}
                            </>
                          )}
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Col>
        
        {/* Resultados en Tiempo Real */}
        <Col lg={4}>
          <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <i className="bi bi-pie-chart me-2"></i>
                Resultados en tiempo real
              </h5>
            </Card.Header>
            <Card.Body>
              {campaignDetail.results.length > 0 && totalVotes > 0 ? (
                <>
                  <div className="mb-4" style={{ height: '250px' }}>
                    {chartData && (
                      <Pie 
                        data={chartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                padding: 10,
                                font: {
                                  size: 11
                                }
                              }
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const label = context.label || '';
                                  const value = context.parsed || 0;
                                  const percentage = totalVotes > 0 
                                    ? ((value / totalVotes) * 100).toFixed(1) 
                                    : '0.0';
                                  return `${label}: ${value} votos (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    )}
                  </div>
                  
                  <h6 className="mb-3 mt-4">Detalle de votos</h6>
                  <div className="voting-results">
                    {campaignDetail.results
                      .sort((a, b) => b.votes - a.votes)
                      .map((result: VoteResult, index: number) => {
                        const percentage = totalVotes > 0 
                          ? ((result.votes / totalVotes) * 100).toFixed(1)
                          : '0.0';
                        
                        return (
                          <div key={result.candidateId} className="result-bar mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="small fw-semibold">
                                {index + 1}. {result.candidateName}
                              </span>
                              <span className="small">
                                <strong>{result.votes}</strong> ({percentage}%)
                              </span>
                            </div>
                            <ProgressBar 
                              now={parseFloat(percentage)} 
                              variant={index === 0 ? 'success' : 'primary'}
                              style={{ height: '8px' }}
                            />
                          </div>
                        );
                      })}
                  </div>
                </>
              ) : (
                <Alert variant="info" className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Aún no hay votos registrados para esta campaña.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CampaignDetailPage;