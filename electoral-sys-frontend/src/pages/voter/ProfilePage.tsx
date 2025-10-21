import { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState<boolean>(false);
  
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
                  
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="mt-2"
                  >
                    {showDetails ? 'Ocultar detalles' : 'Mostrar más detalles'}
                  </Button>
                </Col>
              </Row>
              
              {showDetails && (
                <div className="border-top pt-3">
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="fw-bold">DPI</Form.Label>
                        <p>{user.dpi}</p>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="fw-bold">Fecha de Nacimiento</Form.Label>
                        <p>{new Date(user.fechaNacimiento).toLocaleDateString()}</p>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h4 className="mb-0">Acciones</h4>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary">
                  Cambiar contraseña
                </Button>
                <Button variant="outline-secondary">
                  Actualizar información
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h4 className="mb-0">Estadísticas</h4>
            </Card.Header>
            <Card.Body>
              <p className="mb-2">
                <strong>Participación:</strong> Los datos de participación se cargarán próximamente.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;