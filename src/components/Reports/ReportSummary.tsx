import React from 'react';
import { Users, Stethoscope, Clock, TrendingUp } from 'lucide-react';
import { usePatientStore } from '../../stores/usePatientStore';
import { useConsultationStore } from '../../stores/useConsultationStore';
import type { ReportFilters } from '../../types/report';

interface ReportSummaryProps {
  dateFilter: ReportFilters;
}

const ReportSummary: React.FC<ReportSummaryProps> = ({ dateFilter }) => {
  const { patients } = usePatientStore();
  const { consultations } = useConsultationStore();

  const activePatients = patients.filter(patient => {
    const admission = patient.admissions?.[0];
    return admission?.status === 'active' &&
      new Date(admission.admission_date) >= new Date(dateFilter.dateFrom) &&
      new Date(admission.admission_date) <= new Date(dateFilter.dateTo);
  });

  const activeConsultations = consultations.filter(consultation =>
    consultation.status === 'active' &&
    new Date(consultation.created_at) >= new Date(dateFilter.dateFrom) &&
    new Date(consultation.created_at) <= new Date(dateFilter.dateTo)
  );

  const calculateAverageStay = () => {
    const admissionsWithDuration = activePatients.map(patient => {
      const admission = patient.admissions?.[0];
      if (!admission) return 0;
      
      const admissionDate = new Date(admission.admission_date);
      const now = new Date();
      return Math.ceil((now.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24));
    }).filter(duration => duration > 0);

    if (admissionsWithDuration.length === 0) return 0;
    
    const totalDays = admissionsWithDuration.reduce((sum, days) => sum + days, 0);
    return Math.round(totalDays / admissionsWithDuration.length);
  };

  const occupancyRate = Math.round((activePatients.length / 100) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Total Patients</h3>
        </div>
        <p className="text-2xl md:text-3xl font-bold text-gray-900">{activePatients.length}</p>
        <p className="text-sm text-gray-600 mt-1">Currently admitted</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Stethoscope className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Consultations</h3>
        </div>
        <p className="text-2xl md:text-3xl font-bold text-gray-900">{activeConsultations.length}</p>
        <p className="text-sm text-gray-600 mt-1">Active consultations</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Average Stay</h3>
        </div>
        <p className="text-2xl md:text-3xl font-bold text-gray-900">{calculateAverageStay()}</p>
        <p className="text-sm text-gray-600 mt-1">Days per patient</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Occupancy Rate</h3>
        </div>
        <p className="text-2xl md:text-3xl font-bold text-gray-900">{occupancyRate}%</p>
        <p className="text-sm text-gray-600 mt-1">Current capacity</p>
      </div>
    </div>
  );
};

export default ReportSummary;