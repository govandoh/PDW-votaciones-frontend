/**
 * Configuración de imágenes predefinidas para candidatos
 * 
 * Agrega aquí las rutas de las imágenes que coloques en src/assets/candidates/
 */

export interface CandidateImageOption {
  id: string;
  name: string;
  path: string;
  fileName: string; // Nombre del archivo para guardar en BD
  thumbnail?: string;
}

// Importa las imágenes aquí cuando las agregues
// Ejemplo:
import candidate1 from '../assets/candidates/candidato_1.png';
import candidate2 from '../assets/candidates/candidato_2.png';
import candidate3 from '../assets/candidates/candidato_3.png';

/**
 * Lista de imágenes disponibles para candidatos
 * 
 * Actualiza este array cada vez que agregues nuevas imágenes
 */
export const CANDIDATE_IMAGES: CandidateImageOption[] = [
  // Descomenta y copia este formato para cada imagen:
  
  {
    id: 'candidate-1',
    name: 'Perfil 1',
    path: candidate1,
    fileName: 'candidato_1.png'
  },
  {
    id: 'candidate-2',
    name: 'Perfil 2',
    path: candidate2,
    fileName: 'candidato_2.png'
  },
  {
    id: 'candidate-3',
    name: 'Perfil 3',
    path: candidate3,
    fileName: 'candidato_3.png'
  }
];

/**
 * Imagen por defecto cuando no se ha seleccionado ninguna
 */
export const DEFAULT_CANDIDATE_IMAGE = 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png';

/**
 * Obtener imagen por ID
 */
export const getCandidateImageById = (id: string): string => {
  const image = CANDIDATE_IMAGES.find(img => img.id === id);
  return image ? image.path : DEFAULT_CANDIDATE_IMAGE;
};

/**
 * Obtener ruta de imagen por fileName (nombre guardado en BD)
 */
export const getCandidateImageByFileName = (fileName: string): string => {
  const image = CANDIDATE_IMAGES.find(img => img.fileName === fileName);
  
  if (image) {
    return image.path;
  } else {
    console.warn(`⚠️ Imagen no encontrada para fileName: "${fileName}", usando default`);
    return DEFAULT_CANDIDATE_IMAGE;
  }
};

/**
 * Obtener fileName por ruta de imagen
 */
export const getFileNameFromPath = (path: string): string => {
  const image = CANDIDATE_IMAGES.find(img => img.path === path);
  return image ? image.fileName : 'default';
};

/**
 * Obtener todas las imágenes disponibles
 */
export const getAllCandidateImages = (): CandidateImageOption[] => {
  return CANDIDATE_IMAGES;
};