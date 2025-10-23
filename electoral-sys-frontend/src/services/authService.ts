import api from './api';
import { LoginFormValues, RegisterFormValues, User } from '../types';
import { setToken } from '../utils/auth';

// Tipo para la respuesta de autenticación
interface AuthResponse {
  token: string;
  user: User;
}

// Tipo para los datos de registro (sin confirmPassword)
export interface RegisterData extends Omit<RegisterFormValues, 'confirmPassword'> {}

/**
 * Inicia sesión con las credenciales proporcionadas
 * @param credentials Datos del formulario de inicio de sesión
 * @returns Respuesta con token y datos del usuario
 */
export const login = async (credentials: LoginFormValues): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  
  // Guardar el token en localStorage
  if (response.data.token) {
    setToken(response.data.token);
  }
  
  return response.data;
};

/**
 * Registra un nuevo usuario
 * @param userData Datos del formulario de registro (sin confirmPassword)
 * @returns Respuesta con datos del usuario creado
 */
export const register = async (userData: RegisterData): Promise<User> => {
  const response = await api.post<User>('/auth/register', userData);
  return response.data;
};

/**
 * Verifica si el token actual es válido y devuelve los datos del usuario
 * @returns Datos del usuario si el token es válido
 */
export const verifyAuth = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};