import React from 'react';
import { Users, Stethoscope, Activity } from 'lucide-react';
import { usePatientStore } from '../stores/usePatientStore';
import { useConsultationStore } from '../stores/useConsultationStore';
import type { Patient } from '../types/patient';
import type { Consultation } from '../types/consultation';

const specialties = [
  'Internal Medicine',
  'Pulmonology',
  'Neurology',
  'Gastroenterology',
  'Rheumatology',
  'Endocrinology',
  'Hematology',
  'Infectious Disease',
  'Thrombosis Medicine',
  'Immunology & Allergy'
] as const;

const SpecialtiesGrid: React.FC = () => {
  const { patients } = usePatientStore();
  const { consultations } = useConsultationStore();

  const handleSpecialtyClick = (specialty: string) => {
    const event = new CustomEvent('navigate', { 
      detail: {
        page: 'specialties',
        specialty: specialty
      }
    });
    window.dispatchEvent(event);
  };

  const getSpecialtyData = (specialty: string) => {
    const activePatients = patients.filter(patient => {
      const admission = patient.admissions?.[0];
      return admission?.status === 'active' && admission.department === specialty;
    }).length;

    const activeConsultations = consultations.filter(consultation =>
      consultation.consultation_specialty === specialty &&
      consultation.status === 'active'
    ).length;

    return {
      activePatients,
      activeConsultations,
      totalCases: activePatients + activeConsultations
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {specialties.map((specialty) => {
        const { activePatients, activeConsultations, totalCases } = getSpecialtyData(specialty);

        return (
          <button
            key={specialty}
            onClick={() => handleSpecialtyClick(specialty)}
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
      })}
    </div>
  );
};

export default SpecialtiesGrid;