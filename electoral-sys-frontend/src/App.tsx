import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import PublicRoute from './components/common/PublicRoute';

// Componentes de layout
import Layout from './components/common/Layout';

// Páginas públicas
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/common/NotFoundPage';
import UnauthorizedPage from './pages/common/UnauthorizedPage';

// Páginas protegidas
import DashboardPage from './pages/voter/DashboardPage';
import CampaignsPage from './pages/voter/CampaignsPage';
import CampaignDetailPage from './pages/voter/CampaignDetailPage';
import ProfilePage from './pages/voter/ProfilePage';

// Páginas de administrador
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCampaignsPage from './pages/admin/AdminCampaignsPage';
import AdminCampaignFormPage from './pages/admin/AdminCampaignFormPage';
import AdminCandidatesPage from './pages/admin/AdminCandidatesPage';
import AdminCandidateFormPage from './pages/admin/AdminCandidateFormPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Ruta de acceso no autorizado */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Rutas protegidas - Votantes */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Rutas protegidas - Administradores */}
          <Route element={<PrivateRoute requireAdmin={true} />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/campaigns" element={<AdminCampaignsPage />} />
              <Route path="/admin/campaigns/create" element={<AdminCampaignFormPage />} />
              <Route path="/admin/campaigns/edit/:id" element={<AdminCampaignFormPage />} />
              <Route path="/admin/candidates" element={<AdminCandidatesPage />} />
              <Route path="/admin/candidates/create" element={<AdminCandidateFormPage />} />
              <Route path="/admin/candidates/edit/:id" element={<AdminCandidateFormPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
            </Route>
          </Route>

          {/* Ruta para 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;