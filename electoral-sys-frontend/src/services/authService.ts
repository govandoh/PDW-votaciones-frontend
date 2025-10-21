import api from './api';
import { setToken, setUser, removeToken, removeUser } from '../utils/auth';
import { LoginFormValues, RegisterFormValues, User } from '../types';

// Interfaz para la respuesta de login
interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

// Interfaz para la respuesta de registro
interface RegisterResponse {
  message: string;
  user: User;
}

// Función para iniciar sesión
export const login = async (credentials: LoginFormValues): Promise<User> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    
    // Guardar token y datos del usuario
    setToken(response.data.token);
    setUser(response.data.user);
    
    return response.data.user;
  } catch (error) {
    throw error;
  }
};

// Función para registrar un nuevo usuario
export const register = async (userData: RegisterFormValues): Promise<User> => {
  try {
    const response = await api.post<RegisterResponse>('/auth/register', userData);
    return response.data.user;
  } catch (error) {
    throw error;
  }
};

// Función para verificar el token actual
export const verifyToken = async (): Promise<User> => {
  try {
    const response = await api.get<{user: User}>('/auth/verify');
    setUser(response.data.user);
    return response.data.user;
  } catch (error) {
    removeToken();
    removeUser();
    throw error;
  }
};

// Función para cerrar sesión
export const logout = (): void => {
  removeToken();
  removeUser();
};