import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import UsernameOnboarding from './pages/UsernameOnboarding';
import TemplateSelection from './pages/TemplateSelection';
import PortfolioDeployment from './pages/PortfolioDeployment';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />}/>
          <Route path="/signin" element={<AuthPage />}/>
          <Route path="/onboarding" element={<UsernameOnboarding />}/>
          <Route path="/templates" element={<TemplateSelection />}/>
          <Route path="/portfolio" element={<PortfolioDeployment />}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
