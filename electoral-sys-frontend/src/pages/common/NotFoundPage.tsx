import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="display-1 text-primary mb-4">404</h1>
          <h2 className="mb-4">Página no encontrada</h2>
          <p className="lead mb-5">
            Lo sentimos, la página que está buscando no existe o ha sido movida.
          </p>
          <Link to="/dashboard" className="text-decoration-none">
            <Button 
              variant="primary" 
              size="lg"
            >
              Volver al inicio
            </Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;