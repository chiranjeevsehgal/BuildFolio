import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import UsernameOnboarding from './pages/UsernameOnboarding';
import TemplateSelection from './pages/TemplateSelection';
import PortfolioDeployment from './pages/PortfolioDeployment';
import ProfileDataCollection from './pages/ProfileDataCollection';
import AuthSuccess from './pages/AuthSuccess';
import ProtectedRoute from './auth/ProtectedRoute';
import TemplatePreview from './pages/TemplatePreview';
import TemplatePreview1 from './pages/TemplatePreview1';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<AuthPage />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          {/* <Route path="/onboarding" element={<UsernameOnboarding />} /> */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfileDataCollection />
            </ProtectedRoute>} />
          <Route path="/templates" element={
            <ProtectedRoute>
              <TemplateSelection />
            </ProtectedRoute>
          } />
          <Route path="/preview/:templateId" element={<TemplatePreview />} />
          <Route path="/preview1/:templateId" element={<TemplatePreview1 />} />
          {/* <Route path="/portfolio" element={<PortfolioDeployment />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
