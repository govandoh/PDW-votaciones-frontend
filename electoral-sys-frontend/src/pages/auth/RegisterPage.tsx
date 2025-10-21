import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { register } from '../../services/authService';
import { RegisterFormValues } from '../../types';

const RegisterPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const initialValues: RegisterFormValues = {
    numeroColegiado: '',
    nombres: '',
    apellidos: '',
    correo: '',
    dpi: '',
    fechaNacimiento: '',
    password: '',
    confirmPassword: ''
  };
  
  const validationSchema = Yup.object({
    numeroColegiado: Yup.string()
      .required('El número de colegiado es requerido')
      .matches(/^\d+$/, 'El número de colegiado debe contener solo dígitos'),
    nombres: Yup.string()
      .required('Los nombres son requeridos')
      .max(100, 'Los nombres no pueden exceder los 100 caracteres'),
    apellidos: Yup.string()
      .required('Los apellidos son requeridos')
      .max(100, 'Los apellidos no pueden exceder los 100 caracteres'),
    correo: Yup.string()
      .required('El correo electrónico es requerido')
      .email('Formato de correo electrónico inválido'),
    dpi: Yup.string()
      .required('El DPI es requerido')
      .matches(/^\d{13}$/, 'El DPI debe contener exactamente 13 dígitos numéricos'),
    fechaNacimiento: Yup.date()
      .required('La fecha de nacimiento es requerida')
      .max(new Date(), 'La fecha no puede ser en el futuro'),
    password: Yup.string()
      .required('La contraseña es requerida')
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'La contraseña debe contener al menos una letra minúscula, una letra mayúscula y un número'
      ),
    confirmPassword: Yup.string()
      .required('Debe confirmar la contraseña')
      .oneOf([Yup.ref('password')], 'Las contraseñas deben coincidir')
  });
  
  const handleSubmit = async (values: RegisterFormValues, { setSubmitting }: any) => {
    try {
      setError(null);
      setSuccess(null);
      
      // Enviar los datos completos (RegisterFormValues) al servicio de registro
      // TypeScript espera que confirmPassword esté presente en el objeto
      await register(values);
      setSuccess('¡Registro exitoso! Ahora puede iniciar sesión.');
      setError(null);
      // Redireccionar después de un registro exitoso
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
      setSubmitting(false);
    }
  };
  
  return (
    <Container className="auth-container">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="auth-card shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4 card-title">Registro de Usuario</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, touched, errors }) => (
                  <FormikForm>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Número de Colegiado</Form.Label>
                          <Field
                            name="numeroColegiado"
                            type="text"
                            placeholder="Ingrese su número de colegiado"
                            className={`form-control ${touched.numeroColegiado && errors.numeroColegiado ? 'is-invalid' : ''}`}
                          />
                          <ErrorMessage
                            name="numeroColegiado"
                            component="div"
                            className="invalid-feedback"
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>DPI</Form.Label>
                          <Field
                            name="dpi"
                            type="text"
                            placeholder="Ingrese su DPI (13 dígitos)"
                            className={`form-control ${touched.dpi && errors.dpi ? 'is-invalid' : ''}`}
                          />
                          <ErrorMessage
                            name="dpi"
                            component="div"
                            className="invalid-feedback"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nombres</Form.Label>
                          <Field
                            name="nombres"
                            type="text"
                            placeholder="Ingrese sus nombres"
                            className={`form-control ${touched.nombres && errors.nombres ? 'is-invalid' : ''}`}
                          />
                          <ErrorMessage
                            name="nombres"
                            component="div"
                            className="invalid-feedback"
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Apellidos</Form.Label>
                          <Field
                            name="apellidos"
                            type="text"
                            placeholder="Ingrese sus apellidos"
                            className={`form-control ${touched.apellidos && errors.apellidos ? 'is-invalid' : ''}`}
                          />
                          <ErrorMessage
                            name="apellidos"
                            component="div"
                            className="invalid-feedback"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Correo Electrónico</Form.Label>
                          <Field
                            name="correo"
                            type="email"
                            placeholder="Ingrese su correo electrónico"
                            className={`form-control ${touched.correo && errors.correo ? 'is-invalid' : ''}`}
                          />
                          <ErrorMessage
                            name="correo"
                            component="div"
                            className="invalid-feedback"
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Fecha de Nacimiento</Form.Label>
                          <Field
                            name="fechaNacimiento"
                            type="date"
                            className={`form-control ${touched.fechaNacimiento && errors.fechaNacimiento ? 'is-invalid' : ''}`}
                          />
                          <ErrorMessage
                            name="fechaNacimiento"
                            component="div"
                            className="invalid-feedback"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Contraseña</Form.Label>
                          <Field
                            name="password"
                            type="password"
                            placeholder="Ingrese su contraseña"
                            className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                          />
                          <ErrorMessage
                            name="password"
                            component="div"
                            className="invalid-feedback"
                          />
                          <Form.Text className="text-muted">
                            La contraseña debe tener al menos 8 caracteres e incluir una letra mayúscula, una minúscula y un número.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirmar Contraseña</Form.Label>
                          <Field
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirme su contraseña"
                            className={`form-control ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
                          />
                          <ErrorMessage
                            name="confirmPassword"
                            component="div"
                            className="invalid-feedback"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-100 mt-3"
                    >
                      {isSubmitting ? 'Registrando...' : 'Registrarse'}
                    </Button>
                    
                    <div className="text-center mt-3">
                      ¿Ya tiene una cuenta? <Link to="/login">Iniciar sesión</Link>
                    </div>
                  </FormikForm>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;