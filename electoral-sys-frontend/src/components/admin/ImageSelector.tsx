import { useState } from 'react';
import { Modal, Button, Row, Col, Card, Form } from 'react-bootstrap';
import { CANDIDATE_IMAGES, DEFAULT_CANDIDATE_IMAGE } from '../../config/candidateImages';
import './ImageSelector.scss';

interface ImageSelectorProps {
  show: boolean;
  onHide: () => void;
  onSelect: (fileName: string, imageId: string) => void; // Ahora pasa fileName
  currentImage?: string;
}

const ImageSelector = ({ show, onHide, onSelect, currentImage }: ImageSelectorProps) => {
  const [selectedImageId, setSelectedImageId] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedImagePath, setSelectedImagePath] = useState<string>(currentImage || '');

  const handleImageClick = (id: string, path: string, fileName: string) => {
    setSelectedImageId(id);
    setSelectedImagePath(path);
    setSelectedFileName(fileName);
  };

  const handleConfirm = () => {
    if (selectedFileName) {
      onSelect(selectedFileName, selectedImageId);
      onHide();
    }
  };

  const handleUseDefault = () => {
    onSelect('default', 'default');
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Seleccionar Imagen del Candidato</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {CANDIDATE_IMAGES.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted mb-3">
              No hay imágenes disponibles todavía.
            </p>
            <p className="text-muted small">
              Las imágenes deben agregarse en: <br />
              <code>src/assets/candidates/</code>
            </p>
            <Button 
              variant="outline-primary" 
              onClick={handleUseDefault}
              className="mt-3"
            >
              Usar Imagen por Defecto
            </Button>
          </div>
        ) : (
          <>
            <Form.Label className="mb-3">
              Selecciona una imagen para el candidato:
            </Form.Label>
            
            <Row className="g-3 image-grid">
              {/* Opción de imagen por defecto */}
              <Col xs={6} md={4}>
                <Card 
                  className={`image-option ${selectedImageId === 'default' ? 'selected' : ''}`}
                  onClick={() => handleImageClick('default', DEFAULT_CANDIDATE_IMAGE, 'default')}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Img 
                    variant="top" 
                    src={DEFAULT_CANDIDATE_IMAGE} 
                    alt="Imagen por defecto"
                    style={{ height: '150px', objectFit: 'cover' }}
                  />
                  <Card.Body className="p-2 text-center">
                    <small className="text-muted">Por Defecto</small>
                  </Card.Body>
                </Card>
              </Col>

              {/* Imágenes personalizadas */}
              {CANDIDATE_IMAGES.map((image) => (
                <Col xs={6} md={4} key={image.id}>
                  <Card 
                    className={`image-option ${selectedImageId === image.id ? 'selected' : ''}`}
                    onClick={() => handleImageClick(image.id, image.path, image.fileName)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Img 
                      variant="top" 
                      src={image.path} 
                      alt={image.name}
                      style={{ height: '150px', objectFit: 'cover' }}
                    />
                    <Card.Body className="p-2 text-center">
                      <small className="text-muted">{image.name}</small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleConfirm}
          disabled={!selectedFileName}
        >
          Confirmar Selección
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageSelector;
