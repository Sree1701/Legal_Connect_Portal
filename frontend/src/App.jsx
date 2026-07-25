import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Views
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';

// Auth Views
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import VerifyEmail from './pages/Auth/VerifyEmail';

// Citizen Portal
import CitizenDashboard from './pages/Citizen/CitizenDashboard';
import SubmitComplaint from './pages/Citizen/SubmitComplaint';
import ComplaintDetail from './pages/Citizen/ComplaintDetail';

// Advocate Portal
import AdvocateDashboard from './pages/Advocate/AdvocateDashboard';
import AdvocateComplaintDetail from './pages/Advocate/AdvocateComplaintDetail';

// Admin Dashboard
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManager from './pages/Admin/UserManager';
import ComplaintManager from './pages/Admin/ComplaintManager';
import FeedbackManager from './pages/Admin/FeedbackManager';
import SupportManager from './pages/Admin/SupportManager';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow bg-slate-50 dark:bg-darkBg text-slate-900 dark:text-slate-100 transition-colors duration-200">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/contact" element={<ContactPage />} />

                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />

                  {/* Citizen Portal (Protected) */}
                  <Route 
                    path="/citizen/dashboard" 
                    element={
                      <ProtectedRoute allowedRoles={['citizen']}>
                        <CitizenDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/citizen/submit" 
                    element={
                      <ProtectedRoute allowedRoles={['citizen']}>
                        <SubmitComplaint />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/citizen/complaint/:id" 
                    element={
                      <ProtectedRoute allowedRoles={['citizen']}>
                        <ComplaintDetail />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Advocate Portal (Protected) */}
                  <Route 
                    path="/advocate/dashboard" 
                    element={
                      <ProtectedRoute allowedRoles={['advocate']}>
                        <AdvocateDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/advocate/complaint/:id" 
                    element={
                      <ProtectedRoute allowedRoles={['advocate']}>
                        <AdvocateComplaintDetail />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Admin Portal (Protected) */}
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/users" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <UserManager />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/complaints" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ComplaintManager />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/feedback" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <FeedbackManager />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/support" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <SupportManager />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Catch-all Redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
