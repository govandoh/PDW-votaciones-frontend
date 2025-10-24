import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Image, Row, Col } from 'react-bootstrap';
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';
import { PersonCircle } from 'react-bootstrap-icons';
import { createCandidate, updateCandidate, getCandidateById } from '../../services/candidateService';
import { getAllCampaigns } from '../../services/campaignService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Campaign, CandidateFormValues } from '../../types';

const AdminCandidateFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCampaignId = searchParams.get('campaignId');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<CandidateFormValues>({
    nombre: '',
    descripcion: '',
    foto: null,
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
          setInitialValues({
            nombre: candidateData.nombre,
            descripcion: candidateData.descripcion,
            foto: null,
            campañaId: candidateData.campaña
          });
          setPreviewImage(candidateData.foto);
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
    foto: Yup.mixed()
      .nullable()
      .test('fileSize', 'La imagen es demasiado grande (máximo 2MB)', 
        value => !value || (value instanceof File && value.size <= 2 * 1024 * 1024))
      .test('fileType', 'Solo se permiten imágenes (jpg, jpeg, png)', 
        value => !value || (value instanceof File && ['image/jpeg', 'image/jpg', 'image/png'].includes(value.type)))
  });
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      setFieldValue('foto', null);
      setPreviewImage(null);
      return;
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('El archivo debe ser una imagen (jpg, jpeg o png)');
      setFieldValue('foto', null);
      setPreviewImage(null);
      return;
    }

    // Validar tamaño del archivo (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('La imagen es demasiado grande (máximo 2MB)');
      setFieldValue('foto', null);
      setPreviewImage(null);
      return;
    }

    try {
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFieldValue('foto', result);
      };
      reader.readAsDataURL(file);
      setError(null);
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      setError('Error al procesar la imagen');
      setFieldValue('foto', null);
      setPreviewImage(null);
    }
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
                      <Form.Label>Foto</Form.Label>
                      <div className="mb-3 candidate-photo-preview">
                        {previewImage ? (
                          <Image 
                            src={previewImage} 
                            alt="Vista previa de la foto del candidato" 
                            thumbnail 
                            className="w-100 preview-image"
                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div 
                            className="bg-light d-flex align-items-center justify-content-center text-center placeholder-wrapper"
                            style={{ height: '200px', border: '1px solid #dee2e6', borderRadius: '0.25rem' }}
                          >
                            <PersonCircle size={64} className="text-secondary" />
                          </div>
                        )}
                      </div>
                      <Form.Control
                        type="file"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, setFieldValue)}
                        accept="image/jpeg,image/png,image/jpg"
                        isInvalid={touched.foto && !!errors.foto}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.foto}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted mt-2">
                        Sube una imagen del candidato (JPG, JPEG o PNG, máx. 2MB)
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
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminCandidateFormPage;