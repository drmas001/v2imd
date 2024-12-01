import React from 'react';
import { Shield } from 'lucide-react';
import { usePatientStore } from '../../../../stores/usePatientStore';
import type { Patient } from '../../../../types/patient';
import type { Admission } from '../../../../types/admission';

interface SafetyAdmissionStatsProps {
  dateFilter: {
    startDate: string;
    endDate: string;
    period: string;
  };
}

const SafetyAdmissionStats: React.FC<SafetyAdmissionStatsProps> = ({ dateFilter }) => {
  const { patients } = usePatientStore();

  const activeAdmissions = patients.filter((patient: Patient) => {
    const admissions = patient.admissions as Admission[] | undefined;
    return admissions?.some(admission => 
      admission.status === 'active' &&
      new Date(admission.admission_date) >= new Date(dateFilter.startDate) &&
      new Date(admission.admission_date) <= new Date(dateFilter.endDate)
    );
  });

  const safetyData = activeAdmissions.reduce((acc, patient) => {
    const admission = patient.admissions?.[0];
    if (admission?.safety_type) {
      acc[admission.safety_type] = (acc[admission.safety_type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalSafetyAdmissions = Object.values(safetyData).reduce((sum, count) => sum + count, 0);
  const safetyRate = activeAdmissions.length > 0 
    ? Math.round((totalSafetyAdmissions / activeAdmissions.length) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Shield className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Safety Admissions</h2>
          <p className="text-sm text-gray-500">
            {totalSafetyAdmissions} safety admissions ({safetyRate}% of total)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-sm font-medium text-red-600">Emergency</p>
          <p className="text-2xl font-bold text-red-900">{safetyData['emergency'] || 0}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm font-medium text-yellow-600">Observation</p>
          <p className="text-2xl font-bold text-yellow-900">{safetyData['observation'] || 0}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-green-600">Short Stay</p>
          <p className="text-2xl font-bold text-green-900">{safetyData['short-stay'] || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default SafetyAdmissionStats;