import React, { useState, useEffect } from 'react';
import AppLayout from './components/Layout/AppLayout';
import PublicLayout from './components/Layout/PublicLayout';
import DashboardStats from './components/Dashboard/DashboardStats';
import PatientProfile from './pages/PatientProfile';
import ConsultationRegistration from './pages/ConsultationRegistration';
import Reports from './pages/Reports';
import PatientDischarge from './pages/PatientDischarge';
import Specialties from './pages/Specialties';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import EmployeeManagement from './components/Administration/EmployeeManagement';
import AppointmentBooking from './pages/AppointmentBooking';
import NewAdmission from './pages/NewAdmission';
import Profile from './pages/Profile';
import { useSupabase } from './hooks/useSupabase';
import { useUserStore } from './stores/useUserStore';
import { usePatientStore } from './stores/usePatientStore';
import type { Page, NavigationEvent } from './types/navigation';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const { isLoading, error } = useSupabase();
  const { currentUser, logout } = useUserStore();
  const { setSelectedPatient } = usePatientStore();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      const user = currentUser;
      if (user) {
        setIsAuthenticated(true);
        if (user.role === 'administrator') {
          setCurrentPage('employees');
        }
      } else {
        setIsAuthenticated(false);
        setCurrentPage('dashboard');
      }
    };

    checkSession();
  }, [currentUser]);

  // Handle navigation
  useEffect(() => {
    const handleNavigate = (event: NavigationEvent) => {
      const detail = event.detail;
      
      if (typeof detail === 'object' && 'page' in detail) {
        setCurrentPage(detail.page);
        if (detail.specialty) {
          setSelectedSpecialty(detail.specialty);
        }
        window.history.pushState({}, '', `/${detail.page}`);
      } else if (typeof detail === 'string') {
        setCurrentPage(detail as Page);
        setSelectedSpecialty(null);
        window.history.pushState({}, '', `/${detail}`);
      }
    };

    const handlePopState = () => {
      const path = window.location.pathname.slice(1) || 'dashboard';
      if (path as Page) {
        setCurrentPage(path as Page);
        setSelectedSpecialty(null);
      }
    };

    // Handle initial URL
    const initialPath = window.location.pathname.slice(1);
    if (initialPath === '') {
      if (!isAuthenticated) {
        window.history.replaceState({}, '', '/');
      } else {
        window.history.replaceState({}, '', '/dashboard');
        setCurrentPage('dashboard');
      }
    } else if (initialPath as Page) {
      setCurrentPage(initialPath as Page);
    }

    window.addEventListener('navigate', handleNavigate as EventListener);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    window.history.pushState({}, '', '/dashboard');
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
    setSelectedPatient(null);
    window.history.pushState({}, '', '/');
  };

  // Handle public pages
  if (!isAuthenticated) {
    return (
      <PublicLayout>
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'terms' && <TermsPage />}
        {currentPage === 'login' && <LoginPage onLogin={handleLogin} />}
        {currentPage === 'dashboard' && <LandingPage />}
      </PublicLayout>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <AppLayout
      currentPage={currentPage}
      onNavigate={(page) => setCurrentPage(page)}
      onLogout={handleLogout}
    >
      {currentPage === 'dashboard' && <DashboardStats />}
      {currentPage === 'patient' && <PatientProfile />}
      {currentPage === 'consultation' && <ConsultationRegistration />}
      {currentPage === 'reports' && <Reports />}
      {currentPage === 'discharge' && <PatientDischarge />}
      {currentPage === 'specialties' && (
        <Specialties
          onNavigateToPatient={() => setCurrentPage('patient')}
          selectedSpecialty={selectedSpecialty || undefined}
        />
      )}
      {currentPage === 'employees' && <EmployeeManagement />}
      {currentPage === 'appointments' && <AppointmentBooking />}
      {currentPage === 'new-admission' && <NewAdmission />}
      {currentPage === 'profile' && <Profile />}
    </AppLayout>
  );
};

export default App;