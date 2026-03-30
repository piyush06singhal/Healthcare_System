import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './store';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import DoctorsPage from './pages/DoctorsPage';
import BlogPage from './pages/BlogPage';
import PatientDashboard from './pages/PatientDashboard';
import HealthCalculators from './pages/HealthCalculators';
import Appointments from './pages/Appointments';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SymptomPredictor from './pages/SymptomPredictor';
import Profile from './pages/Profile';
import MedicalRecords from './pages/MedicalRecords';
import MedicalInsights from './pages/MedicalInsights';
import VideoGeneration from './pages/VideoGeneration';

// Components
import DashboardLayout from './components/DashboardLayout';
import Chatbot from './components/Chatbot';
import { Toaster } from 'sonner';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const DashboardHome = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'doctor') return <DoctorDashboard />;
  return <PatientDashboard />;
};

export default function App() {
  return (
    <Provider store={store}>
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
            
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route index element={<DashboardHome />} />
                    <Route path="appointments" element={<Appointments />} />
                    <Route path="records" element={<MedicalRecords />} />
                    <Route path="calculators" element={<HealthCalculators />} />
                    <Route path="ai-chat" element={<SymptomPredictor />} />
                    <Route path="insights" element={<MedicalInsights />} />
                    <Route path="video-gen" element={<VideoGeneration />} />
                    <Route path="profile" element={<Profile />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Chatbot />
          <Toaster position="top-right" richColors />
        </div>
      </Router>
    </Provider>
  );
}
