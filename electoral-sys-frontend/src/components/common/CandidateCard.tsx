import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { getCandidateImageByFileName } from '../../config/candidateImages';

// Definición de la interfaz para las props
interface CandidateCardProps {
  candidate?: {
    _id?: string;
    id?: number;
    nombre?: string;
    name?: string;
    descripcion?: string;
    position?: string;
    party?: string;
    foto?: string;
    photo?: string;
  };
  onVote?: (candidateId: string | number) => void;
  disabled?: boolean;
  votes?: number;
  showResults?: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ 
  candidate,
  onVote,
  disabled = false,
  votes = 0,
  showResults = false
}) => {
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

  // Adaptador para manejar diferentes estructuras de datos
  const candidateId = candidate._id || candidate.id || '';
  const candidateName = candidate.nombre || candidate.name || '';
  const candidateDesc = candidate.descripcion || candidate.position || '';
  const candidateParty = candidate.party || '';
  const candidatePhotoFileName = candidate.foto || candidate.photo || 'default';
  
  // Convertir fileName a ruta de imagen
  const candidatePhoto = getCandidateImageByFileName(candidatePhotoFileName);

  return (
    <Card className="candidate-card h-100 shadow-sm">
      <div style={{ height: '180px', overflow: 'hidden' }}>
        <Card.Img 
          variant="top" 
          src={candidatePhoto} 
          className="candidate-image"
          alt={candidateName} 
        />
      </div>
      <Card.Body>
        <Card.Title>{candidateName}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{candidateDesc}</Card.Subtitle>
        {candidateParty && (
          <Card.Text>
            Partido: {candidateParty}
          </Card.Text>
        )}
        
        {showResults && (
          <Card.Text className="text-primary fw-bold">
            Votos actuales: {votes}
          </Card.Text>
        )}
      </Card.Body>
      
      {onVote && (
        <Card.Footer className="bg-white">
          <div className="d-grid">
            <Button 
              variant="primary" 
              className="btn-vote"
              onClick={() => onVote(candidateId)}
              disabled={disabled}
            >
              Votar
            </Button>
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default CandidateCard;