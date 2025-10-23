import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { RegisterFormValues } from '../../types';
import { register } from '../../services/authService';

const RegisterPage: React.FC = () => {
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
      .required('El número de colegiado es requerido'),
    nombres: Yup.string()
      .required('Los nombres son requeridos'),
    apellidos: Yup.string()
      .required('Los apellidos son requeridos'),
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
      
      // Remover confirmPassword antes de enviar los datos
      const { confirmPassword, ...registerData } = values;
      
      console.log("Datos a enviar:", registerData); // Para depuración
      
      await register(registerData);
      setSuccess('¡Registro exitoso! Ahora puede iniciar sesión.');
      
      // Redireccionar después de un registro exitoso
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error("Error completo:", err); // Para depuración
      setError(err.response?.data?.message || 'Error al registrar usuario');
      setSubmitting(false);
    }
  };
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Registro de Usuario</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ handleSubmit, handleChange, handleBlur, values, touched, errors, isSubmitting }) => (
                  <Form noValidate onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
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
                      </Col>
                      
                      <Col md={6}>
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
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nombres</Form.Label>
                          <Form.Control
                            type="text"
                            name="nombres"
                            value={values.nombres}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.nombres && !!errors.nombres}
                            placeholder="Ingrese sus nombres"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.nombres}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Apellidos</Form.Label>
                          <Form.Control
                            type="text"
                            name="apellidos"
                            value={values.apellidos}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.apellidos && !!errors.apellidos}
                            placeholder="Ingrese sus apellidos"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.apellidos}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Correo Electrónico</Form.Label>
                          <Form.Control
                            type="email"
                            name="correo"
                            value={values.correo}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.correo && !!errors.correo}
                            placeholder="Ingrese su correo electrónico"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.correo}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
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
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
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
                          <Form.Text className="text-muted">
                            La contraseña debe tener al menos 8 caracteres e incluir una letra mayúscula, una minúscula y un número.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirmar Contraseña</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.confirmPassword && !!errors.confirmPassword}
                            placeholder="Confirme su contraseña"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword}
                          </Form.Control.Feedback>
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

export default RegisterPage;