import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import TemplateSelection from './pages/TemplateSelection';
import PortfolioDeployment from './pages/PortfolioDeployment';
import AuthSuccess from './pages/AuthSuccess';
import ProtectedRoute from './auth/ProtectedRoute';
import TemplatePreview from './pages/TemplatePreview';
import PublicPortfolio from './pages/PublicPortfolio';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedAdminRoute from './auth/ProtectedAdminRoute';
import Profile from './pages/Profile';
import AdminApp from './pages/admin/DashboardApp';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<AuthPage />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>} />
          <Route path="/templates" element={
            <ProtectedRoute>
              <TemplateSelection />
            </ProtectedRoute>
          } />
          <Route path="/preview/:templateId" element={
            <ProtectedRoute>
              <TemplatePreview />
            </ProtectedRoute>
          } />

          <Route path="/portfolio" element={
            <ProtectedRoute>
              <PortfolioDeployment />
            </ProtectedRoute>
          } />
          <Route path="/portfolio/:username" element={<PublicPortfolio />} />

          {/* Admin Route */}
          <Route path="/admin" element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
          />
          <Route path="/admin1" element={
            <ProtectedAdminRoute>
              <AdminApp />
            </ProtectedAdminRoute>
          }
          />

          {/* Catch all route for 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
