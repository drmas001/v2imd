import React from 'react';
import { Users, Stethoscope, Activity } from 'lucide-react';
import type { Patient } from '../../types/patient';
import type { Consultation } from '../../types/consultation';
import { usePatientStore } from '../../stores/usePatientStore';

interface SpecialtyCardProps {
  specialty: string;
  patients: Patient[];
  consultations: Consultation[];
  onNavigateToPatient: () => void;
}

const SpecialtyCard: React.FC<SpecialtyCardProps> = ({
  specialty,
  patients,
  consultations,
  onNavigateToPatient
}) => {
  const { setSelectedPatient } = usePatientStore();
  const activePatients = patients.length;
  const activeConsultations = consultations.length;
  const totalCases = activePatients + activeConsultations;

  const handleClick = () => {
    // If there's only one patient, select it automatically
    if (activePatients === 1) {
      setSelectedPatient(patients[0]);
      onNavigateToPatient();
    } else {
      // Navigate to specialty view to show all patients
      const event = new CustomEvent('navigate', { 
        detail: {
          page: 'specialties',
          specialty: specialty
        }
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left w-full"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 mb-4">
        <Users className="h-6 w-6" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{specialty}</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Active Patients</span>
          <span className="text-sm font-medium text-gray-900">{activePatients}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-4 w-4 text-indigo-600" />
            <span className="text-sm text-gray-600">Active Consultations</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{activeConsultations}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-indigo-600" />
            <span className="text-sm text-gray-600">Total Cases</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{totalCases}</span>
        </div>
      </div>
    </button>
  );
};

export default SpecialtyCard;