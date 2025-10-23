import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { User } from '../types';
import { getToken, getUser, removeToken, removeUser } from '../utils/auth';
import { verifyAuth } from '../services/authService';
import socketService from '../services/socketService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      
      if (token) {
        try {
          // Verificar si el token no ha expirado
          const decoded: any = jwtDecode(token);
          
          if (decoded.exp * 1000 < Date.now()) {
            handleLogout();
          } else {
            // Cargar usuario desde localStorage o verificar token
            const storedUser = getUser();
            
            if (storedUser) {
              setUser(storedUser);
              socketService.connect();
            } else {
              try {
                const userData = await verifyAuth();
                setUser(userData);
                socketService.connect();
              } catch (error) {
                handleLogout();
              }
            }
          }
        } catch (error) {
          handleLogout();
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    socketService.connect();
  };

  const handleLogout = () => {
    removeToken();
    removeUser();
    setUser(null);
    socketService.disconnect();
    navigate('/login');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    login: handleLogin,
    logout: handleLogout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};