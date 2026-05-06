import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './store';
import { motion, AnimatePresence } from 'motion/react';
import React, { Suspense, lazy } from 'react';

// Loading Component
const PageLoading = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10">
    <motion.div 
      animate={{ 
        scale: [1, 1.1, 1],
        rotate: [0, 180, 360]
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20"
    >
      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
    </motion.div>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Initializing Medical OS...</div>
  </div>
);

// Lazy Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const DoctorsPage = lazy(() => import('./pages/DoctorsPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const PatientOverview = lazy(() => import('./pages/PatientOverview'));
const PatientAppointments = lazy(() => import('./pages/PatientAppointments'));
const PatientRecords = lazy(() => import('./pages/PatientRecords'));
const PatientPrescriptions = lazy(() => import('./pages/PatientPrescriptions'));
const PatientAIChat = lazy(() => import('./pages/PatientAIChat'));
const PatientTreatments = lazy(() => import('./pages/PatientTreatments'));
const PatientMessages = lazy(() => import('./pages/PatientMessages'));
const PatientFamily = lazy(() => import('./pages/PatientFamily'));
const DoctorOverview = lazy(() => import('./pages/DoctorOverview'));
const DoctorAppointments = lazy(() => import('./pages/DoctorAppointments'));
const DoctorSchedule = lazy(() => import('./pages/DoctorSchedule'));
const DoctorPatients = lazy(() => import('./pages/DoctorPatients'));
const DoctorInsights = lazy(() => import('./pages/DoctorInsights'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SymptomPredictor = lazy(() => import('./pages/SymptomPredictor'));
const Profile = lazy(() => import('./pages/Profile'));
const HealthCalculators = lazy(() => import('./pages/HealthCalculators'));
const MedicalRecords = lazy(() => import('./pages/MedicalRecords'));
const MedicalInsights = lazy(() => import('./pages/MedicalInsights'));
const VideoGeneration = lazy(() => import('./pages/VideoGeneration'));
const DoctorAIChat = lazy(() => import('./pages/DoctorAIChat'));
const DoctorAIWorkbench = lazy(() => import('./pages/DoctorAIWorkbench'));
const DoctorPrescriptions = lazy(() => import('./pages/DoctorPrescriptions'));
const DoctorNotifications = lazy(() => import('./pages/DoctorNotifications'));
const DoctorDiagnostics = lazy(() => import('./pages/DoctorDiagnostics'));
const DoctorMessages = lazy(() => import('./pages/DoctorMessages'));
const StaffManagement = lazy(() => import('./pages/StaffManagement'));
const VideoConsultation = lazy(() => import('./pages/VideoConsultation'));
const PatientDetail = lazy(() => import('./pages/PatientDetail'));
const PharmacyDashboard = lazy(() => import('./pages/PharmacyDashboard'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Security = lazy(() => import('./pages/Security'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));

// Components
import DashboardLayout from './components/DashboardLayout';
import Chatbot from './components/Chatbot';
import ErrorBoundary from './components/ErrorBoundary';
import { NotificationProvider } from './contexts/NotificationContext';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

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
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="appointments" element={isDoctor ? <DoctorAppointments /> : <PatientAppointments />} />
          <Route path="records" element={isDoctor ? <DoctorPatients /> : <PatientRecords />} />
          <Route path="schedule" element={isDoctor ? <DoctorSchedule /> : <Navigate to="/dashboard" replace />} />
          <Route path="patients" element={isDoctor ? <DoctorPatients /> : <Navigate to="/dashboard" replace />} />
          <Route path="patients/:id" element={isDoctor ? <PatientDetail /> : <Navigate to="/dashboard" replace />} />
          <Route path="prescriptions" element={isDoctor ? <DoctorPrescriptions /> : <PatientPrescriptions />} />
          <Route path="pharmacy" element={isDoctor ? <PharmacyDashboard /> : <Navigate to="/dashboard" replace />} />
          <Route path="notifications" element={isDoctor ? <DoctorNotifications /> : <Navigate to="/dashboard" replace />} />
          <Route path="ai-workbench" element={isDoctor ? <DoctorAIWorkbench /> : <Navigate to="/dashboard" replace />} />
          <Route path="diagnostics" element={isDoctor ? <DoctorDiagnostics /> : <Navigate to="/dashboard" replace />} />
          <Route path="insights" element={isDoctor ? <DoctorInsights /> : <Navigate to="/dashboard" replace />} />
          <Route path="ai-chat" element={isDoctor ? <DoctorAIChat /> : <PatientAIChat />} />
          <Route path="treatments" element={isDoctor ? <Navigate to="/dashboard" replace /> : <PatientTreatments />} />
          <Route path="messages" element={isDoctor ? <DoctorMessages /> : <PatientMessages />} />
          <Route path="staff" element={isDoctor ? <StaffManagement /> : <Navigate to="/dashboard" replace />} />
          <Route path="family" element={isDoctor ? <Navigate to="/dashboard" replace /> : <PatientFamily />} />
          <Route path="calculators" element={<HealthCalculators />} />
          <Route path="video-gen" element={<VideoGeneration />} />
          <Route path="video-consultation" element={<VideoConsultation />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <NotificationProvider>
        <ErrorBoundary>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Suspense fallback={<PageLoading />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
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
            </Suspense>
            <Chatbot />
            <Toaster position="top-right" richColors />
          </div>
        </Router>
      </ErrorBoundary>
      </NotificationProvider>
    </Provider>
  );
}
