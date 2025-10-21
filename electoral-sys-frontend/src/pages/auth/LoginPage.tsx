import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { LoginFormValues } from '../../types';
import { login as loginService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
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
      const user = await loginService(values);
      login(user);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="auth-container">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="auth-card shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4 card-title">Iniciar Sesión</h2>

              {error && <Alert variant="danger">{error}</Alert>}

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <FormikForm>
                    <Form.Group className="mb-3">
                      <Form.Label>Número de Colegiado</Form.Label>
                      <Field
                        name="numeroColegiado"
                        type="text"
                        placeholder="Ingrese su número de colegiado"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="numeroColegiado"
                        component="div"
                        className="text-danger"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>DPI</Form.Label>
                      <Field
                        name="dpi"
                        type="text"
                        placeholder="Ingrese su DPI (13 dígitos)"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="dpi"
                        component="div"
                        className="text-danger"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Nacimiento</Form.Label>
                      <Field
                        name="fechaNacimiento"
                        type="date"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="fechaNacimiento"
                        component="div"
                        className="text-danger"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Contraseña</Form.Label>
                      <Field
                        name="password"
                        type="password"
                        placeholder="Ingrese su contraseña"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-danger"
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-100 mb-3"
                    >
                      {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>

                    <div className="text-center">
                      ¿No tiene una cuenta?{' '}
                      <Link to="/register">Regístrese aquí</Link>
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

export default LoginPage;