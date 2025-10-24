import { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState<boolean>(false);
  
  // Verificar qué campos están disponibles
  const hasDpi = user && (user as any).dpi;
  const hasFechaNacimiento = user && (user as any).fechaNacimiento;
  const hasAdditionalDetails = hasDpi || hasFechaNacimiento;
  
  if (!user) {
    return (
      <Container>
        <Alert variant="warning">
          No se pudo cargar la información del usuario.
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="mb-4">Perfil de {user.nombres} {user.apellidos}</h1>
      
      <Row>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Row className="mb-4">
                <Col md={4}>
                  <div className="text-center mb-3">
                    <div 
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                      style={{ width: '120px', height: '120px', fontSize: '3rem' }}
                    >
                      {user.nombres.charAt(0)}{user.apellidos.charAt(0)}
                    </div>
                  </div>
                </Col>
                
                <Col md={8}>
                  <h3>{user.nombres} {user.apellidos}</h3>
                  <p className="text-muted mb-2">
                    Número de colegiado: <strong>{user.numeroColegiado}</strong>
                  </p>
                  <p className="text-muted mb-2">
                    Correo: <strong>{user.correo}</strong>
                  </p>
                  <p className="text-muted mb-2">
                    Rol: <strong>{user.role === 'admin' ? 'Administrador' : 'Votante'}</strong>
                  </p>
                  
                  {hasAdditionalDetails && (
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => setShowDetails(!showDetails)}
                      className="mt-2"
                    >
                      {showDetails ? 'Ocultar detalles' : 'Mostrar más detalles'}
                    </Button>
                  )}
                </Col>
              </Row>
              
              {showDetails && hasAdditionalDetails && (
                <div className="border-top pt-3">
                  <Row>
                    {hasDpi && (
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label className="fw-bold">DPI</Form.Label>
                          <p>{(user as any).dpi}</p>
                        </Form.Group>
                      </Col>
                    )}
                    
                    {hasFechaNacimiento && (
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label className="fw-bold">Fecha de Nacimiento</Form.Label>
                          <p>
                            {(() => {
                              const fechaNacimiento = (user as any).fechaNacimiento;
                              
                              try {
                                // Si es una cadena en formato DD-MM-YYYY
                                if (typeof fechaNacimiento === 'string' && fechaNacimiento.includes('-')) {
                                  const parts = fechaNacimiento.split('-');
                                  
                                  // Formato DD-MM-YYYY
                                  if (parts.length === 3 && parts[0].length <= 2) {
                                    const [day, month, year] = parts;
                                    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                    
                                    if (!isNaN(date.getTime())) {
                                      return date.toLocaleDateString('es-GT', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      });
                                    }
                                  }
                                }
                                
                                // Intentar parsear como fecha ISO o cualquier otro formato
                                const date = new Date(fechaNacimiento);
                                
                                if (!isNaN(date.getTime())) {
                                  return date.toLocaleDateString('es-GT', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  });
                                }
                                
                                // Si no se puede parsear, mostrar el valor original
                                return fechaNacimiento;
                              } catch (error) {
                                // Si hay error, mostrar el valor original
                                return fechaNacimiento;
                              }
                            })()}
                          </p>
                        </Form.Group>
                      </Col>
                    )}
                  </Row>
                  
                  {!hasDpi && !hasFechaNacimiento && (
                    <Alert variant="info" className="mt-3">
                      No hay información adicional disponible en este momento.
                    </Alert>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;