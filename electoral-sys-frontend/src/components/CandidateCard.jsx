import { Card, Button } from 'react-bootstrap';

function CandidateCard({ candidate }) {
  // Si no hay candidato, mostramos un placeholder
  if (!candidate) {
    candidate = {
      id: 1,
      name: 'Nombre del Candidato',
      position: 'Posición',
      party: 'Partido Político',
      photo: 'https://via.placeholder.com/150'
    };
  }

  return (
    <Card className="candidate-card h-100">
      <Card.Img 
        variant="top" 
        src={candidate.photo} 
        className="candidate-image"
        alt={candidate.name} 
      />
      <Card.Body>
        <Card.Title>{candidate.name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{candidate.position}</Card.Subtitle>
        <Card.Text>
          Partido: {candidate.party}
        </Card.Text>
        <div className="d-grid">
          <Button variant="primary" className="btn-vote">
            Votar
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default CandidateCard;