import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { LoginFormValues } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { login as loginService } from '../../services/authService';

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/dashboard';
  
  const initialValues: LoginFormValues = {
    numeroColegiado: '',
    dpi: '',
    fechaNacimiento: '',
    password: ''
  };

  const validationSchema = Yup.object({
    numeroColegiado: Yup.string()
      .required('El número de colegiado es requerido'),
    dpi: Yup.string()
      .required('El DPI es requerido')
      .matches(/^\d{13}$/, 'El DPI debe contener 13 dígitos'),
    fechaNacimiento: Yup.date()
      .required('La fecha de nacimiento es requerida')
      .max(new Date(), 'La fecha no puede ser en el futuro'),
    password: Yup.string()
      .required('La contraseña es requerida')
  });

  const handleSubmit = async (values: LoginFormValues, { setSubmitting }: any) => {
    try {
      setError(null);
      console.log('Intentando iniciar sesión con:', values);
      
      const response = await loginService(values);
      console.log('Login exitoso, respuesta:', response);
      
      if (response && response.user) {
        // Llamar a la función de login del contexto con el usuario
        login(response.user);
        navigate(from, { replace: true });
      } else {
        console.error('La respuesta no contiene datos de usuario:', response);
        setError('No se recibieron datos de usuario. Contacte al administrador.');
      }
    } catch (err: any) {
      console.error('Error completo durante el login:', err);
      
      // Extraer mensaje de error de manera más detallada
      let errorMsg = 'Error al iniciar sesión';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        } else if (err.response.data.error) {
          errorMsg = err.response.data.error;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Iniciar Sesión</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ handleSubmit, handleChange, handleBlur, values, touched, errors, isSubmitting }) => (
                  <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Número de Colegiado</Form.Label>
                      <Form.Control
                        type="text"
                        name="numeroColegiado"
                        value={values.numeroColegiado}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.numeroColegiado && !!errors.numeroColegiado}
                        placeholder="Ingrese su número de colegiado"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.numeroColegiado}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>DPI</Form.Label>
                      <Form.Control
                        type="text"
                        name="dpi"
                        value={values.dpi}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.dpi && !!errors.dpi}
                        placeholder="Ingrese su DPI (13 dígitos)"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.dpi}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Nacimiento</Form.Label>
                      <Form.Control
                        type="date"
                        name="fechaNacimiento"
                        value={values.fechaNacimiento}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.fechaNacimiento && !!errors.fechaNacimiento}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.fechaNacimiento}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && !!errors.password}
                        placeholder="Ingrese su contraseña"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-100"
                    >
                      {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                    
                    <div className="text-center mt-3">
                      ¿No tiene una cuenta? <Link to="/register">Regístrese aquí</Link>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;