import { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, ButtonGroup, Table, Alert } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { getAllCampaigns } from '../../services/campaignService';
import { generateCampaignReport } from '../../services/campaignService';
import { getCampaignResults } from '../../services/voteService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Campaign } from '../../types';

// Registrar componentes de ChartJS
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminReportsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const campaignIdParam = searchParams.get('campaignId');
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaignIdParam || '');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cargar todas las campañas
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const campaignsData = await getAllCampaigns();
        setCampaigns(campaignsData);
        
        if (campaignIdParam && campaignsData.some(c => c._id === campaignIdParam)) {
          setSelectedCampaignId(campaignIdParam);
          fetchReportData(campaignIdParam);
        } else if (campaignsData.length > 0 && !campaignIdParam) {
          setSelectedCampaignId(campaignsData[0]._id);
          fetchReportData(campaignsData[0]._id);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setError('Error al cargar las campañas');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaigns();
  }, [campaignIdParam]);
  
  // Cargar datos del reporte cuando cambia la campaña seleccionada
  const fetchReportData = async (campaignId: string) => {
    if (!campaignId) return;
    
    try {
      setReportLoading(true);
      const data = await generateCampaignReport(campaignId);
      setReportData(data);
      
      // Actualizar URL con el parámetro de la campaña seleccionada
      setSearchParams({ campaignId });
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Error al cargar los datos del reporte');
    } finally {
      setReportLoading(false);
    }
  };
  
  const handleCampaignChange = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    fetchReportData(campaignId);
  };
  
  const handleExportPDF = () => {
    // Implementar exportación a PDF (esta es una función simulada)
    alert('Exportación a PDF no implementada en esta versión');
  };
  
  const handleExportCSV = () => {
    // Implementar exportación a CSV (esta es una función simulada)
    alert('Exportación a CSV no implementada en esta versión');
  };
  
  // Preparar datos para gráficos si hay reportData
  const pieChartData = reportData ? {
    labels: reportData.statistics.results.map((result: any) => result.candidateName),
    datasets: [
      {
        data: reportData.statistics.results.map((result: any) => result.votes),
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
  } : null;
  
  const barChartData = reportData ? {
    labels: reportData.statistics.results.map((result: any) => result.candidateName),
    datasets: [
      {
        label: 'Votos',
        data: reportData.statistics.results.map((result: any) => result.votes),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  } : null;
  
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribución de Votos por Candidato',
      },
    },
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Container>
      <h1 className="mb-4">Reportes de Campañas</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {campaigns.length === 0 ? (
        <Alert variant="info">
          No hay campañas disponibles para generar reportes.
        </Alert>
      ) : (
        <>
          <Card className="mb-4 shadow-sm report-filter-card">
            <Card.Body>
              <Row>
                <Col md={8}>
                  <Form.Group controlId="campaignSelector">
                    <Form.Label className="fw-bold">Seleccionar Campaña:</Form.Label>
                    <Form.Select
                      value={selectedCampaignId}
                      onChange={(e) => handleCampaignChange(e.target.value)}
                      className="form-select-lg campaign-selector"
                    >
                      {campaigns.map(campaign => (
                        <option key={campaign._id} value={campaign._id}>
                          {campaign.titulo} 
                          <span className="campaign-status">
                            {campaign.estado === 'activa' ? '(Activa)' : 
                             campaign.estado === 'finalizada' ? '(Finalizada)' : 
                             '(Inactiva)'}
                          </span>
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <Button 
                    variant="outline-primary" 
                    className="w-100"
                    onClick={() => fetchReportData(selectedCampaignId)}
                  >
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Actualizar Reporte
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          {reportLoading ? (
            <div className="text-center py-5 loading-container">
              <div className="spinner-container">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <div className="spinner-grow text-primary ms-2" role="status" style={{ width: '1rem', height: '1rem' }}>
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <div className="spinner-grow text-primary ms-2" role="status" style={{ width: '0.75rem', height: '0.75rem' }}>
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
              <p className="mt-3 loading-message">
                <i className="bi bi-bar-chart-line me-2"></i>
                Generando estadísticas y gráficos...
              </p>
              <div className="progress mt-3" style={{ height: '4px', maxWidth: '250px', margin: '0 auto' }}>
                <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: '100%' }}></div>
              </div>
            </div>
          ) : error ? (
            <Alert variant="danger" className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill fs-4 me-2"></i>
              <div>
                <strong>Error:</strong> {error}
                <div className="mt-2">
                  <Button size="sm" variant="outline-danger" onClick={() => fetchReportData(selectedCampaignId)}>
                    <i className="bi bi-arrow-clockwise me-1"></i> Reintentar
                  </Button>
                </div>
              </div>
            </Alert>
          ) : reportData ? (
            <>
              <Card className="mb-4 shadow-sm report-header-card">
                <Card.Body>
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div className="mb-3 mb-md-0">
                      <h2 className="h3 mb-1">{reportData.campaign.title}</h2>
                      <p className="text-muted mb-0">
                        <span className={`badge bg-${
                          reportData.campaign.status === 'Activa' ? 'success' : 
                          reportData.campaign.status === 'Finalizada' ? 'primary' : 
                          'secondary'
                        } me-2`}>
                          {reportData.campaign.status}
                        </span>
                        <span>
                          {new Date(reportData.campaign.startDate).toLocaleDateString()} - {new Date(reportData.campaign.endDate).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                    <div className="export-buttons d-flex gap-2">
                      <Button 
                        variant="outline-primary" 
                        className="export-btn" 
                        onClick={handleExportPDF}
                      >
                        <i className="bi bi-file-pdf me-2"></i>
                        Exportar PDF
                      </Button>
                      <Button 
                        variant="outline-success" 
                        className="export-btn" 
                        onClick={handleExportCSV}
                      >
                        <i className="bi bi-file-spreadsheet me-2"></i>
                        Exportar CSV
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
              
              <Row className="report-stats-row">
                <Col md={6} className="mb-4">
                  <Card className="h-100 shadow-sm report-info-card">
                    <Card.Header className="bg-light">
                      <h3 className="h5 mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        Información de la Campaña
                      </h3>
                    </Card.Header>
                    <Card.Body>
                      <Row className="mb-4">
                        <Col sm={6} className="mb-3 mb-sm-0">
                          <div className="stat-item">
                            <span className="stat-label">Estado:</span>
                            <span className={`stat-value badge bg-${
                              reportData.campaign.status === 'Activa' ? 'success' : 
                              reportData.campaign.status === 'Finalizada' ? 'primary' : 
                              'secondary'
                            }`}>
                              {reportData.campaign.status}
                            </span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Votos por Votante:</span>
                            <span className="stat-value">{reportData.campaign.votesPerVoter}</span>
                          </div>
                        </Col>
                        <Col sm={6}>
                          <div className="stat-item">
                            <span className="stat-label">Fecha de Inicio:</span>
                            <span className="stat-value">{new Date(reportData.campaign.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Fecha de Fin:</span>
                            <span className="stat-value">{new Date(reportData.campaign.endDate).toLocaleDateString()}</span>
                          </div>
                        </Col>
                      </Row>
                      
                      <hr className="divider" />
                      
                      <div className="stats-summary">
                        <Row className="text-center">
                          <Col xs={4}>
                            <div className="summary-stat">
                              <div className="summary-value">{reportData.statistics.totalCandidates}</div>
                              <div className="summary-label">Candidatos</div>
                            </div>
                          </Col>
                          <Col xs={4}>
                            <div className="summary-stat">
                              <div className="summary-value">{reportData.statistics.totalUniqueVoters}</div>
                              <div className="summary-label">Votantes</div>
                            </div>
                          </Col>
                          <Col xs={4}>
                            <div className="summary-stat">
                              <div className="summary-value">{reportData.statistics.totalVotesCast}</div>
                              <div className="summary-label">Votos</div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6} className="mb-4">
                  <Card className="h-100 shadow-sm chart-card">
                    <Card.Header className="bg-light">
                      <h3 className="h5 mb-0">
                        <i className="bi bi-pie-chart me-2"></i>
                        Gráfico de Resultados
                      </h3>
                    </Card.Header>
                    <Card.Body>
                      <div className="chart-container">
                        {pieChartData && (
                          <Pie 
                            data={pieChartData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom',
                                  labels: {
                                    usePointStyle: true,
                                    padding: 20
                                  }
                                }
                              }
                            }}
                          />
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <Row>
                <Col md={12} className="mb-4">
                  <Card className="shadow-sm bar-chart-card">
                    <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                      <h3 className="h5 mb-0">
                        <i className="bi bi-bar-chart me-2"></i>
                        Distribución de Votos
                      </h3>
                      <div className="chart-controls">
                        <ButtonGroup size="sm">
                          <Button variant="outline-secondary" title="Alternar vista">
                            <i className="bi bi-grid"></i>
                          </Button>
                          <Button variant="outline-secondary" title="Descargar gráfico">
                            <i className="bi bi-download"></i>
                          </Button>
                        </ButtonGroup>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <div className="chart-container" style={{ height: '350px' }}>
                        {barChartData ? (
                          <Bar 
                            data={barChartData} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'top',
                                  labels: {
                                    usePointStyle: true,
                                    boxWidth: 6,
                                    font: {
                                      size: 12
                                    }
                                  }
                                },
                                title: {
                                  display: false
                                },
                                tooltip: {
                                  backgroundColor: 'rgba(0,0,0,0.8)',
                                  titleFont: {
                                    size: 14
                                  },
                                  bodyFont: {
                                    size: 13
                                  },
                                  callbacks: {
                                    label: function(context) {
                                      return `Votos: ${context.raw}`;
                                    }
                                  }
                                }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  grid: {
                                    color: "rgba(0,0,0,0.05)"
                                  },
                                  ticks: {
                                    precision: 0
                                  }
                                },
                                x: {
                                  grid: {
                                    display: false
                                  }
                                }
                              }
                            }}
                          />
                        ) : (
                          <div className="text-center py-5">
                            <i className="bi bi-bar-chart-steps text-muted" style={{ fontSize: '3rem' }}></i>
                            <p className="text-muted mt-3">No hay datos disponibles para mostrar</p>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <Card className="shadow-sm mb-4 results-table-card">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                  <h3 className="h5 mb-0">
                    <i className="bi bi-table me-2"></i>
                    Resultados Detallados
                  </h3>
                  <Form.Group controlId="tableFilter" className="d-flex align-items-center" style={{ width: '200px' }}>
                    <Form.Control
                      size="sm"
                      type="text"
                      placeholder="Buscar candidato..."
                      className="me-2"
                    />
                  </Form.Group>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table hover className="results-table align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="position-column">#</th>
                          <th>Candidato</th>
                          <th className="text-center">Votos</th>
                          <th className="text-center">Porcentaje</th>
                          <th className="text-center">Visualización</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.statistics.results.sort((a: any, b: any) => b.votes - a.votes).map((result: any, index: number) => (
                          <tr key={result.candidateId}>
                            <td className="position-column text-center fw-bold">{index + 1}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="candidate-avatar me-2 text-center">
                                  <div className="avatar-placeholder" style={{ 
                                    backgroundColor: pieChartData?.datasets[0].backgroundColor[index % 7], 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                  }}>
                                    {result.candidateName.charAt(0)}
                                  </div>
                                </div>
                                <div>
                                  <div className="candidate-name fw-semibold">{result.candidateName}</div>
                                  <div className="candidate-id small text-muted">ID: {result.candidateId.substring(0, 8)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center fw-bold">{result.votes}</td>
                            <td className="text-center">
                              <span className="badge bg-light text-dark">{result.percentage}</span>
                            </td>
                            <td className="text-center">
                              <div className="progress" style={{ height: '8px' }}>
                                <div 
                                  className="progress-bar" 
                                  role="progressbar" 
                                  style={{ 
                                    width: result.percentage,
                                    backgroundColor: pieChartData?.datasets[0].backgroundColor[index % 7]
                                  }} 
                                  aria-valuenow={parseFloat(result.percentage)} 
                                  aria-valuemin={0} 
                                  aria-valuemax={100}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white d-flex justify-content-between align-items-center">
                  <small className="text-muted">Total de candidatos: {reportData.statistics.totalCandidates}</small>
                  <ButtonGroup size="sm">
                    <Button variant="outline-secondary" title="Exportar resultados">
                      <i className="bi bi-download"></i>
                    </Button>
                    <Button variant="outline-secondary" title="Imprimir resultados">
                      <i className="bi bi-printer"></i>
                    </Button>
                  </ButtonGroup>
                </Card.Footer>
              </Card>
            </>
          ) : (
            <Card className="shadow-sm mb-4">
              <Card.Body className="text-center py-5">
                <div className="empty-state">
                  <i className="bi bi-clipboard-data text-muted" style={{ fontSize: '3rem' }}></i>
                  <h4 className="mt-3">No hay datos disponibles</h4>
                  <p className="text-muted">
                    No se encontraron resultados para la campaña seleccionada.
                  </p>
                  <div className="mt-3">
                    <Button variant="primary" onClick={() => fetchReportData(selectedCampaignId)}>
                      <i className="bi bi-arrow-repeat me-2"></i>
                      Intentar nuevamente
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </Container>
  );
};

export default AdminReportsPage;