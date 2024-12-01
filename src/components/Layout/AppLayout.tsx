import React from 'react';
import Sidebar from '../Sidebar';
import DashboardHeader from '../DashboardHeader';
import { ToastContainer } from '../ui/Toast';
import { useToast } from '../../hooks/useToast';
import type { Page } from '../../types/navigation';

interface AppLayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  currentPage,
  onNavigate,
  onLogout,
  children
}) => {
  const [notifications, setNotifications] = React.useState(2);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { toasts, dismissToast } = useToast();

  const handleNotificationClick = () => {
    setNotifications(0);
  };

  const handleUserMenuClick = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleProfileClick = () => {
    onNavigate('profile');
    setIsUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <DashboardHeader
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          isUserMenuOpen={isUserMenuOpen}
          onUserMenuClick={handleUserMenuClick}
          onLogout={onLogout}
          onProfileClick={handleProfileClick}
          onMobileMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default AppLayout;