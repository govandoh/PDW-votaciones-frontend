import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PublicRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (user) {
    // Si ya está autenticado, redirigir a la página principal
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

export default PublicRoute;