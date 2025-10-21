import { Container, Nav, Navbar as BootstrapNavbar, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <BootstrapNavbar bg="primary" variant="dark" expand="lg" className="mb-3">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/dashboard">
          Sistema Electoral
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/campaigns">Campañas</Nav.Link>
            {isAdmin() && (
              <>
                <NavDropdown title="Administración" id="admin-dropdown">
                  <NavDropdown.Item as={Link} to="/admin/dashboard">Panel Admin</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/admin/campaigns">Gestionar Campañas</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/admin/candidates">Gestionar Candidatos</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/admin/reports">Reportes</NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
          <Nav>
            <NavDropdown 
              title={
                <>
                  <i className="bi bi-person-circle me-1"></i>
                  {user?.nombres || 'Usuario'}
                </>
              } 
              id="user-dropdown"
            >
              <NavDropdown.Item as={Link} to="/profile">Mi Perfil</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Cerrar Sesión</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;