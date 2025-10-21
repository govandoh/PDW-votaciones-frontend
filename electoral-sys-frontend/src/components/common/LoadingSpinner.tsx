import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  message = 'Cargando...'
}) => {
  if (fullScreen) {
    return (
      <Container 
        className="d-flex flex-column justify-content-center align-items-center" 
        style={{ 
          height: '100vh', 
          width: '100vw', 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
          zIndex: 9999 
        }}
      >
        <Spinner animation="border" role="status" variant="primary" />
        <span className="mt-3">{message}</span>
      </Container>
    );
  }

  return (
    <div className="text-center my-5">
      <Spinner animation="border" role="status" variant="primary" />
      <p className="mt-2">{message}</p>
    </div>
  );
};

export default LoadingSpinner;