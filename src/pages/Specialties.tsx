import React, { useState, useEffect } from 'react';
import { Search, Filter, Stethoscope } from 'lucide-react';
import { usePatientStore } from '../stores/usePatientStore';
import { useConsultationStore } from '../stores/useConsultationStore';
import SpecialtyCard from '../components/Specialties/SpecialtyCard';
import SpecialtyFilter from '../components/Specialties/SpecialtyFilter';
import ConsultationList from '../components/Specialties/ConsultationList';
import type { Patient } from '../types/patient';
import type { Consultation } from '../types/consultation';

interface SpecialtiesProps {
  onNavigateToPatient: () => void;
  selectedSpecialty?: string;
}

const Specialties: React.FC<SpecialtiesProps> = ({ onNavigateToPatient, selectedSpecialty }) => {
  const { patients, setSelectedPatient } = usePatientStore();
  const { consultations } = useConsultationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState(selectedSpecialty || 'all');
  const [activeTab, setActiveTab] = useState<'patients' | 'consultations'>('patients');

  useEffect(() => {
    if (selectedSpecialty) {
      setFilterSpecialty(selectedSpecialty);
    }
  }, [selectedSpecialty]);

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
  ];

  const getSpecialtyData = (specialty: string) => {
    const specialtyPatients = patients.filter((patient: Patient) => 
      patient.admissions?.some(admission => 
        admission.department === specialty && 
        admission.status === 'active'
      )
    );

    const specialtyConsultations = consultations.filter((consultation: Consultation) =>
      consultation.consultation_specialty === specialty &&
      consultation.status === 'active'
    );

    return {
      patients: specialtyPatients,
      consultations: specialtyConsultations
    };
  };

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    onNavigateToPatient();
  };

  const filteredSpecialties = specialties.filter(specialty =>
    filterSpecialty === 'all' || specialty === filterSpecialty
  );

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Medical Specialties</h1>
        <p className="text-gray-600">Overview of all medical departments and their current patients</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name or MRN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
          >
            <option value="all">All Specialties</option>
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
        </div>
      </div>

      {filterSpecialty !== 'all' ? (
        <div className="mt-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => setActiveTab('patients')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                activeTab === 'patients'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>Active Patients</span>
            </button>
            <button
              onClick={() => setActiveTab('consultations')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                activeTab === 'consultations'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Stethoscope className="h-4 w-4" />
              <span>Active Consultations</span>
            </button>
          </div>

          {activeTab === 'patients' ? (
            <div className="space-y-4">
              {getSpecialtyData(filterSpecialty).patients.map(patient => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientClick(patient)}
                  className="w-full p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-600">MRN: {patient.mrn}</p>
                      {patient.admissions?.[0]?.admitting_doctor && (
                        <p className="text-sm text-gray-600 mt-1">
                          Doctor: {patient.admissions[0].admitting_doctor.name}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {patient.admissions?.[0]?.safety_type && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          patient.admissions[0].safety_type === 'emergency'
                            ? 'bg-red-100 text-red-800'
                            : patient.admissions[0].safety_type === 'observation'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {patient.admissions[0].safety_type}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(patient.admissions?.[0]?.admission_date || '').toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <ConsultationList 
              consultations={getSpecialtyData(filterSpecialty).consultations}
              onPatientClick={handlePatientClick}
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpecialties.map(specialty => {
            const { patients: specialtyPatients, consultations: specialtyConsultations } = getSpecialtyData(specialty);
            
            const filteredPatients = specialtyPatients.filter(patient =>
              searchQuery === '' ||
              patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              patient.mrn.toLowerCase().includes(searchQuery.toLowerCase())
            );

            const filteredConsultations = specialtyConsultations.filter(consultation =>
              searchQuery === '' ||
              consultation.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              consultation.mrn.toLowerCase().includes(searchQuery.toLowerCase())
            );

            return (
              <SpecialtyCard
                key={specialty}
                specialty={specialty}
                patients={filteredPatients}
                consultations={filteredConsultations}
                onNavigateToPatient={onNavigateToPatient}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Specialties;