import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { getCampaignById } from '../../services/campaignService';
import { castVote } from '../../services/voteService';
import socketService from '../../services/socketService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatRemainingTime } from '../../utils/auth';
import { CampaignDetail, VoteResult } from '../../types';

// Registrar componentes de ChartJS
ChartJS.register(ArcElement, Tooltip, Legend);

const CampaignDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // Estados con useState
  const [campaignDetail, setCampaignDetail] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [votesRemaining, setVotesRemaining] = useState<number>(0);
  const [voteSuccess, setVoteSuccess] = useState<string | null>(null);
  
  // useRef para mantener referencias a las desuscripciones de socket
  const socketCleanupRef = useRef<(() => void)[]>([]);
  
  // useCallback para memoizar la función de voto
  const handleVote = useCallback(async (candidateId: string) => {
    if (!id) return;
    
    try {
      setError(null);
      setVoteSuccess(null);
      await castVote(id, candidateId);
      
      // Actualizar votos restantes localmente
      setVotesRemaining(prev => prev - 1);
      setVoteSuccess("¡Voto registrado exitosamente!");
      
      // El socket actualizará los resultados automáticamente
      setTimeout(() => {
        setVoteSuccess(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error casting vote:', error);
      setError(error.response?.data?.message || 'Error al emitir el voto');
    }
  }, [id]);

  // useEffect para cargar los datos iniciales
  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getCampaignById(id);
        setCampaignDetail(data);
        setIsActive(data.campaign.estado === 'activa');
        setVotesRemaining(data.votesRemaining);
        setError(null);
      } catch (error) {
        console.error('Error fetching campaign details:', error);
        setError('No se pudo cargar la información de la campaña');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [id]);

  // useEffect para configurar los sockets
  useEffect(() => {
    if (!id || !campaignDetail) return;
    
    // Asegurar que el socket esté conectado
    if (!socketService.isConnected()) {
      socketService.connect();
    }
    
    // Unirse a la sala de la campaña
    socketService.joinCampaign(id);
    
    // Suscribirse a eventos de socket
    const voteUpdateCleanup = socketService.onVoteUpdate(data => {
      if (data.campaignId === id && campaignDetail) {
        setCampaignDetail({
          ...campaignDetail,
          results: data.results
        });
      }
    });
    
    const statusChangeCleanup = socketService.onCampaignStatusChange(data => {
      if (data.campaignId === id) {
        setIsActive(data.isActive);
      }
    });
    
    const timeUpdateCleanup = socketService.onTimeUpdate(data => {
      if (data.campaignId === id) {
        setRemainingTime(data.remainingTime);
      }
    });
    
    // Guardar referencias a las funciones de limpieza
    socketCleanupRef.current = [voteUpdateCleanup, statusChangeCleanup, timeUpdateCleanup];
    
    // Cleanup al desmontar
    return () => {
      socketService.leaveCampaign(id);
      socketCleanupRef.current.forEach(cleanup => cleanup());
    };
  }, [id, campaignDetail]);

  // Preparar datos para el gráfico
  const chartData = {
    labels: campaignDetail?.results.map(r => r.candidateName) || [],
    datasets: [
      {
        label: 'Votos',
        data: campaignDetail?.results.map(r => r.votes) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
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
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!campaignDetail) {
    return (
      <Container>
        <Alert variant="warning">
          No se encontró la campaña solicitada o ocurrió un error al cargarla.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="campaign-detail">
      <div className="voting-header">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="campaign-title">{campaignDetail.campaign.titulo}</h1>
          <Badge 
            bg={isActive ? 'success' : 'secondary'}
            className="campaign-status py-2 px-3"
          >
            {isActive ? 'Votación Activa' : 'Votación Inactiva'}
          </Badge>
        </div>
        
        <p className="campaign-description lead mb-4">{campaignDetail.campaign.descripcion}</p>
        
        {/* Timer y Votos Restantes */}
        <Row className="mb-4">
          {isActive && remainingTime !== null && (
            <Col md={6} className="mb-3">
              <div className="voting-timer">
                <h5 className="timer-label">Tiempo restante para votar:</h5>
                <p className="timer-value">
                  {formatRemainingTime(remainingTime)}
                </p>
              </div>
            </Col>
          )}
          
          <Col md={isActive && remainingTime !== null ? 6 : 12}>
            <Card className="bg-light">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">Votos disponibles</h5>
                    <p className="mb-0">
                      <strong>{votesRemaining}</strong> de {campaignDetail.campaign.cantidadVotosPorVotante}
                    </p>
                  </div>
                  <div>
                    <h5 className="mb-1">Votos emitidos</h5>
                    <p className="mb-0">
                      <strong>{campaignDetail.votesUsed}</strong> de {campaignDetail.campaign.cantidadVotosPorVotante}
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {voteSuccess && (
          <Alert variant="success" dismissible onClose={() => setVoteSuccess(null)}>
            {voteSuccess}
          </Alert>
        )}
      </div>

      <Row>
        {/* Lista de Candidatos */}
        <Col lg={8} className="mb-4">
          <h2 className="mb-4">Candidatos</h2>
          <Row>
            {campaignDetail.candidates.length === 0 ? (
              <Col>
                <Alert variant="info">
                  No hay candidatos registrados en esta campaña.
                </Alert>
              </Col>
            ) : (
              campaignDetail.candidates.map(candidate => {
                const candidateResult = campaignDetail.results.find(
                  r => r.candidateId === candidate._id
                );
                const votes = candidateResult ? candidateResult.votes : 0;
                
                return (
                  <Col key={candidate._id} md={6} lg={6} className="mb-4">
                    <Card className="h-100 candidate-card shadow-sm">
                      <div style={{ height: '180px', overflow: 'hidden' }}>
                        <Card.Img 
                          variant="top" 
                          src={candidate.foto || 'https://via.placeholder.com/300x180?text=Candidato'}
                          className="candidate-image"
                          alt={candidate.nombre}
                        />
                      </div>
                      <Card.Body>
                        <Card.Title>{candidate.nombre}</Card.Title>
                        <Card.Text>{candidate.descripcion}</Card.Text>
                        <Card.Text className="text-primary fw-bold">
                          Votos actuales: {votes}
                        </Card.Text>
                      </Card.Body>
                      <Card.Footer className="bg-white">
                        <Button 
                          variant="primary" 
                          className="w-100 btn-vote" 
                          onClick={() => handleVote(candidate._id)}
                          disabled={!isActive || votesRemaining <= 0}
                        >
                          Votar
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                );
              })
            )}
          </Row>
        </Col>
        
        {/* Resultados en Tiempo Real */}
        <Col lg={4}>
          <h2 className="mb-4">Resultados en tiempo real</h2>
          <Card className="shadow-sm">
            <Card.Body>
              {campaignDetail.results.length > 0 ? (
                <>
                  <div className="mb-4" style={{ height: '300px' }}>
                    <Pie 
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                  
                  <h5 className="mb-3">Detalle de votos</h5>
                  <div className="voting-results">
                    {campaignDetail.results
                      .sort((a, b) => b.votes - a.votes)
                      .map((result: VoteResult) => {
                        // Calcular porcentaje
                        const totalVotes = campaignDetail.results.reduce(
                          (sum, r) => sum + r.votes, 0
                        );
                        const percentage = totalVotes > 0 
                          ? Math.round((result.votes / totalVotes) * 100) 
                          : 0;
                        
                        return (
                          <div key={result.candidateId} className="result-bar mb-3">
                            <div className="bar-label">
                              <span>{result.candidateName}</span>
                              <span>
                                <strong>{result.votes}</strong> ({percentage}%)
                              </span>
                            </div>
                            <div className="progress">
                              <div 
                                className="progress-bar bg-primary" 
                                role="progressbar" 
                                style={{ width: `${percentage}%` }}
                                aria-valuenow={percentage}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              ) : (
                <Alert variant="info">
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