import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Image, Row, Col } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createCandidate, updateCandidate } from '../../services/candidateService';
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
  
  const isEditing = !!id;
  
  const initialValues: CandidateFormValues = {
    nombre: '',
    descripcion: '',
    foto: null,
    campañaId: preselectedCampaignId || ''
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener todas las campañas
        const campaignsData = await getAllCampaigns();
        setCampaigns(campaignsData);
        
        // Si es edición, obtener datos del candidato
        if (isEditing) {
          // Aquí deberíamos obtener los datos del candidato por ID
          // Como no tenemos implementado ese servicio específico, lo dejamos para una futura implementación
          // const candidate = await getCandidateById(id);
          // setInitialValues({
          //   nombre: candidate.nombre,
          //   descripcion: candidate.descripcion,
          //   foto: null,
          //   campañaId: candidate.campaña
          // });
          // setPreviewImage(candidate.foto);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar los datos necesarios');
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
      .test('fileSize', 'La imagen es demasiado grande (máximo 2MB)', 
        value => !value || (value instanceof File && value.size <= 2 * 1024 * 1024))
      .test('fileType', 'Solo se permiten imágenes (jpg, jpeg, png)', 
        value => !value || (value instanceof File && ['image/jpeg', 'image/jpg', 'image/png'].includes(value.type)))
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
    if (event.currentTarget.files && event.currentTarget.files.length > 0) {
      const file = event.currentTarget.files[0];
      setFieldValue('foto', file);
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, setFieldValue }) => (
              <FormikForm className="candidate-form">
                <Row className="g-4">
                  <Col md={8}>
                    <Form.Group className="mb-4" controlId="candidateName">
                      <Form.Label>Nombre</Form.Label>
                      <Field
                        name="nombre"
                        type="text"
                        placeholder="Ingrese el nombre del candidato"
                        className="form-control"
                        aria-describedby="nombreHelp"
                      />
                      <ErrorMessage
                        name="nombre"
                        component="div"
                        className="form-text text-danger mt-1"
                      />
                      <Form.Text id="nombreHelp" className="text-muted">
                        Nombre completo del candidato (máx. 100 caracteres)
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-4" controlId="candidateDescription">
                      <Form.Label>Descripción</Form.Label>
                      <Field
                        as="textarea"
                        name="descripcion"
                        rows={4}
                        placeholder="Ingrese la descripción del candidato"
                        className="form-control"
                        aria-describedby="descripcionHelp"
                      />
                      <ErrorMessage
                        name="descripcion"
                        component="div"
                        className="form-text text-danger mt-1"
                      />
                      <Form.Text id="descripcionHelp" className="text-muted">
                        Breve descripción del candidato (máx. 500 caracteres)
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-4" controlId="candidateCampaign">
                      <Form.Label>Campaña</Form.Label>
                      <Field
                        as="select"
                        name="campañaId"
                        className="form-select"
                      >
                        <option value="">Seleccione una campaña</option>
                        {campaigns.map(campaign => (
                          <option key={campaign._id} value={campaign._id}>
                            {campaign.titulo}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="campañaId"
                        component="div"
                        className="form-text text-danger mt-1"
                      />
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
                            <span className="text-secondary">
                              <i className="bi bi-image me-2"></i>
                              Vista previa no disponible
                            </span>
                          </div>
                        )}
                      </div>
                      <Form.Control
                        type="file"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, setFieldValue)}
                        accept="image/jpeg,image/png,image/jpg"
                        className="form-control file-input"
                        aria-describedby="fotoHelp"
                      />
                      <ErrorMessage
                        name="foto"
                        component="div"
                        className="form-text text-danger mt-1"
                      />
                      <Form.Text id="fotoHelp" className="text-muted mt-2">
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
              </FormikForm>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminCandidateFormPage;