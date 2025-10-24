import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Image, Row, Col } from 'react-bootstrap';
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';
import { PersonCircle } from 'react-bootstrap-icons';
import { createCandidate, updateCandidate, getCandidateById } from '../../services/candidateService';
import { getAllCampaigns } from '../../services/campaignService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ImageSelector from '../../components/admin/ImageSelector';
import { DEFAULT_CANDIDATE_IMAGE, getCandidateImageByFileName } from '../../config/candidateImages';
import { Campaign, CandidateFormValues } from '../../types';

const AdminCandidateFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCampaignId = searchParams.get('campaignId');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [previewImage, setPreviewImage] = useState<string>(DEFAULT_CANDIDATE_IMAGE);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [currentSetFieldValue, setCurrentSetFieldValue] = useState<((field: string, value: any) => void) | null>(null);
  const [initialValues, setInitialValues] = useState<CandidateFormValues>({
    nombre: '',
    descripcion: '',
    foto: 'default', // Guardamos el fileName, no la ruta
    campañaId: preselectedCampaignId || ''
  });
  
  const isEditing = !!id;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const campaignsData = await getAllCampaigns();
        setCampaigns(campaignsData);
        
        if (isEditing && id) {
          const candidateData = await getCandidateById(id);
          const candidateFoto = candidateData.foto || 'default';
          
          setInitialValues({
            nombre: candidateData.nombre,
            descripcion: candidateData.descripcion,
            foto: candidateFoto, // fileName de la BD
            campañaId: candidateData.campaña
          });
          
          // Convertir fileName a ruta para preview
          const previewPath = getCandidateImageByFileName(candidateFoto);
          setPreviewImage(previewPath);
        }
        
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.message || 'Error al cargar los datos necesarios');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isEditing, id, preselectedCampaignId]);
  
  const validationSchema = Yup.object({
    nombre: Yup.string()
      .required('El nombre es requerido')
      .max(100, 'El nombre no puede exceder los 100 caracteres'),
    descripcion: Yup.string()
      .required('La descripción es requerida')
      .max(500, 'La descripción no puede exceder los 500 caracteres'),
    campañaId: Yup.string()
      .required('Debe seleccionar una campaña'),
    foto: Yup.string()
      .required('Debe seleccionar una imagen')
  });
  
  const handleImageSelect = (fileName: string, imageId: string) => {
    // Obtener la ruta para el preview
    const imagePath = getCandidateImageByFileName(fileName);
    
    setPreviewImage(imagePath);
    if (currentSetFieldValue) {
      currentSetFieldValue('foto', fileName); // Guardamos el fileName, no la ruta
    }
    setError(null);
  };

  const handleOpenImageSelector = (setFieldValue: (field: string, value: any) => void) => {
    setCurrentSetFieldValue(() => setFieldValue);
    setShowImageSelector(true);
  };
  
  const handleSubmit = async (values: CandidateFormValues, { setSubmitting }: any) => {
    try {
      setError(null);
      
      if (isEditing && id) {
        await updateCandidate(id, values);
      } else {
        await createCandidate(values);
      }
      
      navigate('/admin/candidates');
    } catch (error: any) {
      console.error('Error saving candidate:', error);
      setError(error.response?.data?.message || 'Error al guardar el candidato');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Container>
      <h1 className="mb-4">{isEditing ? 'Editar Candidato' : 'Crear Nuevo Candidato'}</h1>
      
      <Card className="shadow-sm candidate-form-card">
        <Card.Body>
          {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
          
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ handleSubmit, handleChange, values, setFieldValue, isSubmitting, touched, errors }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <Row className="g-4">
                  <Col md={8}>
                    <Form.Group className="mb-4" controlId="candidateName">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={values.nombre}
                        onChange={handleChange}
                        isInvalid={touched.nombre && !!errors.nombre}
                        placeholder="Ingrese el nombre del candidato"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.nombre}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Nombre completo del candidato (máx. 100 caracteres)
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-4" controlId="candidateDescription">
                      <Form.Label>Descripción</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="descripcion"
                        value={values.descripcion}
                        rows={4}
                        onChange={handleChange}
                        isInvalid={touched.descripcion && !!errors.descripcion}
                        placeholder="Ingrese la descripción del candidato"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.descripcion}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Breve descripción del candidato (máx. 500 caracteres)
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-4" controlId="candidateCampaign">
                      <Form.Label>Campaña</Form.Label>
                      <Form.Select
                        name="campañaId"
                        value={values.campañaId}
                        onChange={handleChange}
                        isInvalid={touched.campañaId && !!errors.campañaId}
                      >
                        <option value="">Seleccione una campaña</option>
                        {campaigns.map(campaign => (
                          <option key={campaign._id} value={campaign._id}>
                            {campaign.titulo}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.campañaId}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-4" controlId="candidatePhoto">
                      <Form.Label>Foto del Candidato</Form.Label>
                      <div className="mb-3 candidate-photo-preview">
                        <Image 
                          src={previewImage} 
                          alt="Foto del candidato seleccionada" 
                          thumbnail 
                          className="w-100 preview-image"
                          style={{ maxHeight: '200px', objectFit: 'cover' }}
                        />
                      </div>
                      <Button
                        variant="outline-primary"
                        onClick={() => handleOpenImageSelector(setFieldValue)}
                        className="w-100"
                      >
                        <i className="bi bi-images me-2"></i>
                        Seleccionar Imagen
                      </Button>
                      {touched.foto && errors.foto && (
                        <div className="text-danger small mt-2">
                          {errors.foto}
                        </div>
                      )}
                      <Form.Text className="text-muted mt-2 d-block">
                        Selecciona una imagen predefinida del proyecto
                      </Form.Text>
                      <Form.Text className="text-muted mt-1 d-block">
                        Imagen actual: {values.foto ? 'Seleccionada' : 'Ninguna'}
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="d-flex gap-2 mt-4 form-actions">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>
                        {isEditing ? 'Actualizar Candidato' : 'Crear Candidato'}
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/admin/candidates')}
                    disabled={isSubmitting}
                    className="px-4 py-2"
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancelar
                  </Button>
                </div>
              </Form>
            )}
          </Formik>

          {/* Modal de selección de imagen */}
          <ImageSelector
            show={showImageSelector}
            onHide={() => setShowImageSelector(false)}
            onSelect={handleImageSelect}
            currentImage={previewImage}
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminCandidateFormPage;