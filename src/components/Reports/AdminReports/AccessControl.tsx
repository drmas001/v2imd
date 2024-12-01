import React from 'react';
import { Shield } from 'lucide-react';
import { useUserStore } from '../../../stores/useUserStore';

interface AccessControlProps {
  children: React.ReactNode;
}

const AccessControl: React.FC<AccessControlProps> = ({ children }) => {
  const { currentUser } = useUserStore();

  if (currentUser?.role !== 'administrator') {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Shield className="h-6 w-6 text-yellow-600" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800">Access Restricted</h3>
            <p className="text-yellow-700">
              You don't have permission to view administrative reports. Please contact your administrator for access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AccessControl;