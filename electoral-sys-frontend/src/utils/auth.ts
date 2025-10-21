import { User } from '../types';

// Constantes
const TOKEN_KEY = 'electoral_token';
const USER_KEY = 'electoral_user';

// Guardar token en localStorage
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Obtener token de localStorage
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Eliminar token de localStorage
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Guardar datos del usuario en localStorage
export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Obtener datos del usuario de localStorage
export const getUser = (): User | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Eliminar datos del usuario de localStorage
export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// Verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Formatear tiempo restante (segundos a formato mm:ss)
export const formatRemainingTime = (seconds: number): string => {
  if (seconds <= 0) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};