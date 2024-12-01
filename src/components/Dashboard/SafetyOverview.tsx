import React from 'react';
import { Shield } from 'lucide-react';
import { usePatientStore } from '../../stores/usePatientStore';

const SafetyOverview: React.FC = () => {
  const { patients } = usePatientStore();

  const activePatients = patients.filter(patient => 
    patient.admissions?.[0]?.status === 'active'
  );

  const safetyStats = activePatients.reduce((acc, patient) => {
    const safetyType = patient.admissions?.[0]?.safety_type;
    if (safetyType) {
      acc[safetyType] = (acc[safetyType] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalSafety = Object.values(safetyStats).reduce((sum, count) => sum + count, 0);
  const safetyRate = activePatients.length > 0 
    ? Math.round((totalSafety / activePatients.length) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Shield className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Safety Admissions</h2>
          <p className="text-sm text-gray-600">
            {totalSafety} safety admissions ({safetyRate}% of total)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-sm font-medium text-red-600">Emergency</p>
          <p className="text-2xl font-bold text-red-900">{safetyStats['emergency'] || 0}</p>
          <p className="text-sm text-red-600">Immediate attention required</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm font-medium text-yellow-600">Observation</p>
          <p className="text-2xl font-bold text-yellow-900">{safetyStats['observation'] || 0}</p>
          <p className="text-sm text-yellow-600">Under close monitoring</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-green-600">Short Stay</p>
          <p className="text-2xl font-bold text-green-900">{safetyStats['short-stay'] || 0}</p>
          <p className="text-sm text-green-600">Planned brief admission</p>
        </div>
      </div>
    </div>
  );
};

export default SafetyOverview;