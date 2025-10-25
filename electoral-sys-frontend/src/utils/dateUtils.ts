// src/utils/dateUtils.ts

/**
 * Convierte una fecha/hora local (del input datetime-local) a formato ISO UTC
 * para enviar al backend
 * 
 * @param localDateTimeString - String en formato 'YYYY-MM-DDTHH:mm' del input datetime-local
 * @returns String en formato ISO UTC para el backend
 */
export const convertLocalToUTC = (localDateTimeString: string): string => {
  if (!localDateTimeString) return '';
  
  // Crear un objeto Date interpretando la fecha como hora local
  const localDate = new Date(localDateTimeString);
  
  // Convertir a ISO string (esto automáticamente convierte a UTC)
  return localDate.toISOString();
};

/**
 * Convierte una fecha UTC del backend a formato local para el input datetime-local
 * 
 * @param utcDateString - String en formato ISO UTC desde el backend
 * @returns String en formato 'YYYY-MM-DDTHH:mm' para el input datetime-local
 */
export const convertUTCToLocal = (utcDateString: string): string => {
  if (!utcDateString) return '';
  
  // Crear objeto Date (JavaScript automáticamente convierte a hora local)
  const date = new Date(utcDateString);
  
  // Formatear para input datetime-local: 'YYYY-MM-DDTHH:mm'
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Formatea una fecha para mostrar al usuario en su zona horaria local
 * 
 * @param dateString - String de fecha en cualquier formato
 * @param options - Opciones de formateo de Intl.DateTimeFormat
 * @returns Fecha formateada para mostrar
 */
export const formatDateForDisplay = (
  dateString: string, 
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Guatemala' // Zona horaria de Guatemala
  }
): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-GT', options).format(date);
};

/**
 * Obtiene la fecha/hora actual en formato para datetime-local input
 * 
 * @returns String en formato 'YYYY-MM-DDTHH:mm'
 */
export const getCurrentLocalDateTime = (): string => {
  const now = new Date();
  return convertUTCToLocal(now.toISOString());
};

/**
 * Calcula el tiempo restante en segundos entre ahora y una fecha futura
 * 
 * @param endDateString - Fecha de fin en formato ISO
 * @returns Segundos restantes (0 si ya pasó)
 */
export const calculateRemainingSeconds = (endDateString: string): number => {
  const now = new Date();
  const endDate = new Date(endDateString);
  const diffInMs = endDate.getTime() - now.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  
  return diffInSeconds > 0 ? diffInSeconds : 0;
};

/**
 * Formatea segundos a formato legible (ej: "2d 5h 30m")
 * 
 * @param seconds - Segundos totales
 * @returns String formateado
 */
export const formatRemainingTime = (seconds: number): string => {
  if (seconds <= 0) return 'Finalizada';
  
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};