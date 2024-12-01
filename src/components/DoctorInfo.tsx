import React from 'react';
import type { User } from '../types/user';

interface DoctorInfoProps {
  doctor?: {
    id: number;
    name: string;
    medical_code: string;
    role: User['role'];
    department: string;
  } | null;
  className?: string;
}

const DoctorInfo: React.FC<DoctorInfoProps> = ({ doctor, className = '' }) => {
  if (!doctor) {
    return (
      <div className={`text-sm text-gray-500 italic ${className}`}>
        No doctor assigned
      </div>
    );
  }

  const { name, medical_code, department } = doctor;

  return (
    <div className={`text-sm ${className}`}>
      <div className="font-medium text-gray-900">
        Dr. {name}
        {medical_code && <span className="ml-1 text-gray-500">({medical_code})</span>}
      </div>
      {department && (
        <div className="text-gray-600">
          {department}
        </div>
      )}
    </div>
  );
};

export default DoctorInfo;