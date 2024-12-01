import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { usePatientStore } from '../../../stores/usePatientStore';
import { useConsultationStore } from '../../../stores/useConsultationStore';
import { useAppointmentStore } from '../../../stores/useAppointmentStore';
import ComparisonTable from './ComparisonTable';
import HistoricalSummary from './HistoricalSummary';
import TimelineView from './TimelineView';
import type { Appointment } from '../../../types/appointment';

interface HistoricalComparisonProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const HistoricalComparison: React.FC<HistoricalComparisonProps> = ({ dateRange }) => {
  const { patients, loading: patientsLoading, error: patientsError } = usePatientStore();
  const { consultations, loading: consultationsLoading } = useConsultationStore();
  const { appointments, loading: appointmentsLoading } = useAppointmentStore();

  const isLoading = patientsLoading || consultationsLoading || appointmentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-400 animate-spin" />
          <span className="text-gray-600">Loading historical data...</span>
        </div>
      </div>
    );
  }

  if (patientsError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2">
        <AlertCircle className="h-5 w-5" />
        <span>{patientsError}</span>
      </div>
    );
  }

  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);

  // Filter records within date range
  const filteredPatients = patients.filter(patient => {
    const admissionDate = new Date(patient.admission_date || '');
    return admissionDate >= startDate && admissionDate <= endDate;
  });

  const filteredConsultations = consultations.filter(consultation => {
    const consultDate = new Date(consultation.created_at);
    return consultDate >= startDate && consultDate <= endDate;
  });

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.createdAt);
    return appointmentDate >= startDate && appointmentDate <= endDate;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Historical Data Comparison</h2>
        <p className="text-sm text-gray-600 mb-6">
          Showing records from {format(startDate, 'dd MMM yyyy')} to {format(endDate, 'dd MMM yyyy')}
        </p>

        <HistoricalSummary 
          patients={filteredPatients}
          consultations={filteredConsultations}
          appointments={filteredAppointments}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <TimelineView 
          patients={filteredPatients}
          consultations={filteredConsultations}
          appointments={filteredAppointments}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <ComparisonTable 
          patients={filteredPatients}
          consultations={filteredConsultations}
          appointments={filteredAppointments}
        />
      </div>
    </div>
  );
};

export default HistoricalComparison;