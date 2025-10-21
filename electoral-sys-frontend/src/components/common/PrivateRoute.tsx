import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface PrivateRouteProps {
  requireAdmin?: boolean;
}

const PrivateRoute = ({ requireAdmin = false }: PrivateRouteProps) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    // Redirigir a login, guardando la ruta a la que se intentaba acceder
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requireAdmin && !isAdmin()) {
    // Si se requiere ser admin pero el usuario no lo es
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <Outlet />;
};

export default PrivateRoute;