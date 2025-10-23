import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getCampaignById, createCampaign, updateCampaign } from '../../services/campaignService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CampaignFormValues } from '../../types';

const AdminCampaignFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(id ? true : false);
  const [error, setError] = useState<string | null>(null);
  
  // Establecer valores iniciales con fechas por defecto
  const [initialValues, setInitialValues] = useState<CampaignFormValues>({
    titulo: '',
    descripcion: '',
    cantidadVotosPorVotante: 1,
    fechaInicio: new Date().toISOString().slice(0, 16), // Fecha actual en formato 'YYYY-MM-DDTHH:MM'
    fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) // 1 semana después
  });
  
  const isEditing = !!id;
  
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getCampaignById(id);
        
        // Formatear fechas para input type="datetime-local"
        const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16);
        };
        
        setInitialValues({
          titulo: data.campaign.titulo,
          descripcion: data.campaign.descripcion,
          cantidadVotosPorVotante: data.campaign.cantidadVotosPorVotante,
          fechaInicio: formatDate(data.campaign.fechaInicio),
          fechaFin: formatDate(data.campaign.fechaFin)
        });
        
      } catch (error) {
        console.error('Error fetching campaign:', error);
        setError('No se pudo cargar la información de la campaña');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaign();
  }, [id]);
  
  const validationSchema = Yup.object({
    titulo: Yup.string()
      .required('El título es requerido')
      .max(100, 'El título no puede exceder los 100 caracteres'),
    descripcion: Yup.string()
      .required('La descripción es requerida')
      .max(500, 'La descripción no puede exceder los 500 caracteres'),
    cantidadVotosPorVotante: Yup.number()
      .required('La cantidad de votos por votante es requerida')
      .min(1, 'Debe permitir al menos 1 voto por votante')
      .max(10, 'No puede exceder 10 votos por votante')
      .integer('Debe ser un número entero'),
    fechaInicio: Yup.date()
      .required('La fecha de inicio es requerida'),
    fechaFin: Yup.date()
      .required('La fecha de fin es requerida')
      .min(
        Yup.ref('fechaInicio'),
        'La fecha de finalización debe ser posterior a la fecha de inicio'
      )
  });
  
  const handleSubmit = async (values: CampaignFormValues, { setSubmitting }: any) => {
    try {
      setError(null);
      console.log("Enviando datos de campaña:", values);
      
      if (isEditing && id) {
        await updateCampaign(id, values);
        console.log("Campaña actualizada exitosamente");
      } else {
        await createCampaign(values);
        console.log("Nueva campaña creada exitosamente");
      }
      
      navigate('/admin/campaigns');
    } catch (error: any) {
      console.error('Error saving campaign:', error);
      const errorMessage = error.response?.data?.message || 
                          (error.response?.data?.errors && error.response.data.errors[0]?.msg) ||
                          'Error al guardar la campaña';
      setError(errorMessage);
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Container>
      <h1 className="mb-4">{isEditing ? 'Editar Campaña' : 'Crear Nueva Campaña'}</h1>
      
      <Card className="shadow-sm">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <FormikForm>
                <Form.Group className="mb-3">
                  <Form.Label>Título</Form.Label>
                  <Field
                    name="titulo"
                    type="text"
                    placeholder="Ingrese el título de la campaña"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="titulo"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Field
                    as="textarea"
                    name="descripcion"
                    rows={4}
                    placeholder="Ingrese la descripción de la campaña"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="descripcion"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Votos por Votante</Form.Label>
                  <Field
                    name="cantidadVotosPorVotante"
                    type="number"
                    min="1"
                    max="10"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="cantidadVotosPorVotante"
                    component="div"
                    className="text-danger"
                  />
                  <Form.Text className="text-muted">
                    Número de votos que cada votante puede emitir en esta campaña.
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Fecha y Hora de Inicio</Form.Label>
                  <Field
                    name="fechaInicio"
                    type="datetime-local"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="fechaInicio"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Fecha y Hora de Finalización</Form.Label>
                  <Field
                    name="fechaFin"
                    type="datetime-local"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="fechaFin"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>
                
                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar Campaña' : 'Crear Campaña'}
                  </Button>
                  
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/admin/campaigns')}
                    type="button"
                  >
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

export default AdminCampaignFormPage;