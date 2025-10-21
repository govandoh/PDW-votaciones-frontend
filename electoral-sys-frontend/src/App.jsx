import { useState } from 'react';
import './App.css';
import { Container, Row, Col, Button, Navbar, Nav, Card } from 'react-bootstrap';
import CandidateCard from './components/CandidateCard';

function App() {
  const [count, setCount] = useState(0);
  
  // Datos de ejemplo
  const candidates = [
    { 
      id: 1,
      name: 'Juan Pérez',
      position: 'Presidente',
      party: 'Partido A',
      photo: 'https://via.placeholder.com/150?text=Juan' 
    },
    { 
      id: 2,
      name: 'María López',
      position: 'Vicepresidente',
      party: 'Partido B',
      photo: 'https://via.placeholder.com/150?text=Maria' 
    },
    { 
      id: 3,
      name: 'Carlos Rodríguez',
      position: 'Diputado',
      party: 'Partido C',
      photo: 'https://via.placeholder.com/150?text=Carlos' 
    }
  ];

  return (
    <>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Sistema Electoral</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#dashboard">Dashboard</Nav.Link>
              <Nav.Link href="#candidates">Candidatos</Nav.Link>
              <Nav.Link href="#campaigns">Campañas</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Row className="mb-4">
          <Col>
            <h1>Sistema de Votación Electrónico</h1>
            <p className="lead">
              Bienvenido al sistema de votación electrónico para elecciones seguras y transparentes.
            </p>
            <Button variant="primary" onClick={() => setCount((count) => count + 1)}>
              Contador: {count}
            </Button>
          </Col>
        </Row>
        
        {/* Sección de ejemplo para mostrar tarjetas de candidatos */}
        <Row className="mb-4">
          <Col xs={12}>
            <h2>Candidatos Destacados</h2>
            <p className="text-muted">Utiliza React Bootstrap para renderizar componentes</p>
          </Col>
        </Row>
        
        <Row>
          {candidates.map(candidate => (
            <Col key={candidate.id} md={4} className="mb-4">
              <CandidateCard candidate={candidate} />
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}

export default App;