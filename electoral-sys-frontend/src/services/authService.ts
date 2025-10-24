import api from './api';
import { LoginFormValues, RegisterFormValues, User } from '../types';
import { setToken, setUser } from '../utils/auth';

// Tipo para la respuesta de autenticación
interface AuthResponse {
  token?: string;
  access_token?: string;
  user?: User;
  message?: string;
  [key: string]: any; // Para permitir otros campos que pueda devolver el backend
}

// Tipo para los datos de registro (sin confirmPassword)
export interface RegisterData extends Omit<RegisterFormValues, 'confirmPassword'> {}

/**
 * Inicia sesión con las credenciales proporcionadas
 * @param credentials Datos del formulario de inicio de sesión
 * @returns Respuesta con token y datos del usuario
 */
export const login = async (credentials: LoginFormValues): Promise<AuthResponse> => {
  try {    
    // Formatear fecha a "DD-MM-YYYY" si es necesario
    let fechaNacimiento = credentials.fechaNacimiento;
    if (fechaNacimiento) {
      if (typeof fechaNacimiento === 'object') {
        // Si es un objeto Date, convertirlo a string con formato DD-MM-YYYY
        const date = new Date(fechaNacimiento);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        fechaNacimiento = `${day}-${month}-${year}`;
      } else if (typeof fechaNacimiento === 'string' && fechaNacimiento.includes('-')) {
        // Si es una cadena con guiones pero en formato YYYY-MM-DD (formato del input date)
        const parts = fechaNacimiento.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
          // Está en formato YYYY-MM-DD, convertir a DD-MM-YYYY
          fechaNacimiento = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
    }
    
    // Usar el formato exacto que vimos en Postman
    const loginData = {
      numeroColegiado: credentials.numeroColegiado,
      dpi: credentials.dpi,
      fechaNacimiento: fechaNacimiento,
      password: credentials.password
    };
    const route = '/auth/login';
    const response = await api.post<AuthResponse>(route, loginData);
    console.log('Respuesta del login:', response.statusText);
    
    const responseData = response.data;
    
    
    // Guardar el token y usuario en localStorage
    if (responseData.token) {
      // Caso 1: Formato {token, user}
      setToken(responseData.token);
      
      // También guardamos el usuario para mantener la sesión
      if (responseData.user) {
        setUser(responseData.user);
      }
    } else if (responseData.access_token) {
      // Caso 2: Formato {access_token, user}
      setToken(responseData.access_token);
      
      if (responseData.user) {
        setUser(responseData.user);
      }
    } else if (typeof responseData === 'string') {
      // Caso 3: El token viene directamente como string
      setToken(responseData);
      // En este caso no tenemos usuario, tendremos que hacer una petición adicional
    } else {
      console.warn('No se reconoció el formato de respuesta:', responseData);
    }
    
    // Guardar el token y usuario en localStorage
    // Muchos backends devuelven estructuras diferentes, vamos a manejar varios casos
    if (responseData.token) {
      // Caso 1: Formato {token, user}
      setToken(responseData.token);
      
      // También guardamos el usuario para mantener la sesión
      if (responseData.user) {
        setUser(responseData.user);
      }
    } else if (responseData.access_token) {
      // Caso 2: Formato {access_token, user}
      setToken(responseData.access_token);
      
      if (responseData.user) {
        setUser(responseData.user);
      }
    } else if (typeof responseData === 'string') {
      // Caso 3: El token viene directamente como string
      setToken(responseData);
      // En este caso no tenemos usuario, tendremos que hacer una petición adicional
    } else {
      console.warn('No se reconoció el formato de respuesta:', responseData);
    }
    
    return responseData;
  } catch (error: any) {
    console.error('Error en el login:', error.response?.data || error);
    console.error('Detalles del error:', {
      mensaje: error.response?.data?.message,
      status: error.response?.status,
      datos: error.response?.data
    });
    throw error;
  }
};

/**
 * Registra un nuevo usuario
 * @param userData Datos del formulario de registro (sin confirmPassword)
 * @returns Respuesta con datos del usuario creado
 */
export const register = async (userData: RegisterData): Promise<any> => {
  try {
    // Formatear fecha de nacimiento a "DD-MM-YYYY"
    let fechaNacimiento = userData.fechaNacimiento;
    if (fechaNacimiento) {
      if (typeof fechaNacimiento === 'object') {
        // Si es un objeto Date, convertirlo a string con formato DD-MM-YYYY
        const date = new Date(fechaNacimiento);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        fechaNacimiento = `${day}-${month}-${year}`;
      } else if (typeof fechaNacimiento === 'string' && fechaNacimiento.includes('-')) {
        // Si es una cadena con guiones pero en formato YYYY-MM-DD (formato del input date)
        const parts = fechaNacimiento.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
          // Está en formato YYYY-MM-DD, convertir a DD-MM-YYYY
          fechaNacimiento = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
    }
    
    // Usar el formato exacto que vimos en Postman
    const registerData = {
      numeroColegiado: userData.numeroColegiado,
      nombres: userData.nombres,
      apellidos: userData.apellidos,
      correo: userData.correo,
      dpi: userData.dpi,
      fechaNacimiento: fechaNacimiento,
      password: userData.password
    };
    
    //console.log('Datos a enviar para registro:', JSON.stringify(registerData));
    
    // Ruta correcta observada en Postman
    const route = '/auth/register';
    const response = await api.post(route, registerData);
    
    return response.data;
  } catch (error: any) {
    console.error('Error en el registro:', error.response?.data || error);
    console.error('Detalles del error:', {
      mensaje: error.response?.data?.message,
      status: error.response?.status,
      datos: error.response?.data
    });
    throw error;
  }
};

/**
 * Verifica si el token actual es válido y devuelve los datos del usuario
 * @returns Datos del usuario si el token es válido
 */
export const verifyAuth = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};
