import { Container } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-light py-3 mt-auto">
      <Container>
        <p className="text-center text-muted mb-0">
          &copy; {currentYear} Sistema Electoral - Colegio de Ingenieros de Guatemala
        </p>
      </Container>
    </footer>
  );
};

export default Footer;