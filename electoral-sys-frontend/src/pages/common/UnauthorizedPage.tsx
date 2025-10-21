import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UnauthorizedPage = () => {
  const { logout } = useAuth();

  return (
    <Container className="py-5 text-center unauthorized-container">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="unauthorized-card shadow-lg">
            <Card.Body className="p-5">
              <div className="unauthorized-icon mb-4">
                <i className="bi bi-shield-lock"></i>
              </div>
              <h1 className="display-1 text-danger mb-3">403</h1>
              <h2 className="mb-4">Acceso No Autorizado</h2>
              <p className="lead mb-5">
                Lo sentimos, no tiene permisos para acceder a esta página.
              </p>
              <div className="d-flex justify-content-center gap-3 unauthorized-actions">
                <Link to="/dashboard" className="unauthorized-btn-link">
                  <Button 
                    variant="primary" 
                    size="lg"
                    className="btn-action"
                  >
                    <i className="bi bi-house-door me-2"></i>
                    Volver al inicio
                  </Button>
                </Link>
                <Button 
                  onClick={logout}
                  variant="outline-secondary" 
                  size="lg"
                  className="btn-action"
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar sesión
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UnauthorizedPage;