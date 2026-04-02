import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './store';
import { motion, AnimatePresence } from 'motion/react';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import DoctorsPage from './pages/DoctorsPage';
import BlogPage from './pages/BlogPage';
import PatientOverview from './pages/PatientOverview';
import PatientAppointments from './pages/PatientAppointments';
import PatientRecords from './pages/PatientRecords';
import PatientAIChat from './pages/PatientAIChat';
import DoctorOverview from './pages/DoctorOverview';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorSchedule from './pages/DoctorSchedule';
import DoctorPatients from './pages/DoctorPatients';
import DoctorInsights from './pages/DoctorInsights';
import AdminDashboard from './pages/AdminDashboard';
import SymptomPredictor from './pages/SymptomPredictor';
import Profile from './pages/Profile';
import HealthCalculators from './pages/HealthCalculators';
import MedicalRecords from './pages/MedicalRecords';
import MedicalInsights from './pages/MedicalInsights';
import VideoGeneration from './pages/VideoGeneration';
import DoctorAIChat from './pages/DoctorAIChat';
import DoctorPrescriptions from './pages/DoctorPrescriptions';
import DoctorNotifications from './pages/DoctorNotifications';
import DoctorDiagnostics from './pages/DoctorDiagnostics';
import VideoConsultation from './pages/VideoConsultation';
import PatientDetail from './pages/PatientDetail';
import PharmacyDashboard from './pages/PharmacyDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Security from './pages/Security';
import HelpCenter from './pages/HelpCenter';

// Components
import DashboardLayout from './components/DashboardLayout';
import Chatbot from './components/Chatbot';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'sonner';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const DashboardHome = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'doctor') return <DoctorOverview />;
  return <PatientOverview />;
};

const DashboardRoutes = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isDoctor = user?.role === 'doctor';

  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="appointments" element={isDoctor ? <DoctorAppointments /> : <PatientAppointments />} />
        <Route path="records" element={isDoctor ? <DoctorPatients /> : <PatientRecords />} />
        <Route path="schedule" element={isDoctor ? <DoctorSchedule /> : <Navigate to="/dashboard" replace />} />
        <Route path="patients" element={isDoctor ? <DoctorPatients /> : <Navigate to="/dashboard" replace />} />
        <Route path="patients/:id" element={isDoctor ? <PatientDetail /> : <Navigate to="/dashboard" replace />} />
        <Route path="prescriptions" element={isDoctor ? <DoctorPrescriptions /> : <Navigate to="/dashboard" replace />} />
        <Route path="pharmacy" element={isDoctor ? <PharmacyDashboard /> : <Navigate to="/dashboard" replace />} />
        <Route path="notifications" element={isDoctor ? <DoctorNotifications /> : <Navigate to="/dashboard" replace />} />
        <Route path="diagnostics" element={isDoctor ? <DoctorDiagnostics /> : <Navigate to="/dashboard" replace />} />
        <Route path="insights" element={isDoctor ? <DoctorInsights /> : <Navigate to="/dashboard" replace />} />
        <Route path="ai-chat" element={isDoctor ? <DoctorAIChat /> : <PatientAIChat />} />
        <Route path="calculators" element={<HealthCalculators />} />
        <Route path="video-gen" element={<VideoGeneration />} />
        <Route path="video-consultation" element={<VideoConsultation />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/security" element={<Security />} />
              <Route path="/help" element={<HelpCenter />} />
              
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <DashboardRoutes />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Chatbot />
            <Toaster position="top-right" richColors />
          </div>
        </Router>
      </ErrorBoundary>
    </Provider>
  );
}
