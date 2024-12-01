import React from 'react';
import { Users, Stethoscope, Calendar } from 'lucide-react';
import type { Patient } from '../../../types/patient';
import type { Consultation } from '../../../types/consultation';
import type { Appointment } from '../../../types/appointment';

interface HistoricalSummaryProps {
  patients: Patient[];
  consultations: Consultation[];
  appointments: Appointment[];
}

const HistoricalSummary: React.FC<HistoricalSummaryProps> = ({
  patients,
  consultations,
  appointments
}) => {
  const totalRecords = patients.length + consultations.length + appointments.length;
  
  const activePatients = patients.filter(patient => 
    patient.admissions?.[0]?.status === 'active'
  ).length;

  const dischargedPatients = patients.filter(patient =>
    patient.admissions?.[0]?.status === 'discharged'
  ).length;

  const completedConsultations = consultations.filter(consultation =>
    consultation.status === 'completed'
  ).length;

  const pendingConsultations = consultations.filter(consultation =>
    consultation.status === 'active'
  ).length;

  const completedAppointments = appointments.filter(appointment =>
    appointment.status === 'completed'
  ).length;

  const pendingAppointments = appointments.filter(appointment =>
    appointment.status === 'pending'
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-medium text-indigo-900">Patient Records</h3>
          </div>
          <p className="text-2xl font-bold text-indigo-900">{patients.length}</p>
          <div className="mt-2 space-y-1 text-sm">
            <p className="text-indigo-600">Active: {activePatients}</p>
            <p className="text-indigo-600">Discharged: {dischargedPatients}</p>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Stethoscope className="h-5 w-5 text-purple-600" />
            <h3 className="text-sm font-medium text-purple-900">Consultations</h3>
          </div>
          <p className="text-2xl font-bold text-purple-900">{consultations.length}</p>
          <div className="mt-2 space-y-1 text-sm">
            <p className="text-purple-600">Completed: {completedConsultations}</p>
            <p className="text-purple-600">Pending: {pendingConsultations}</p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <h3 className="text-sm font-medium text-green-900">Appointments</h3>
          </div>
          <p className="text-2xl font-bold text-green-900">{appointments.length}</p>
          <div className="mt-2 space-y-1 text-sm">
            <p className="text-green-600">Completed: {completedAppointments}</p>
            <p className="text-green-600">Pending: {pendingAppointments}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Records</p>
            <p className="text-lg font-semibold text-gray-900">{totalRecords}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Cases</p>
            <p className="text-lg font-semibold text-gray-900">
              {activePatients + pendingConsultations + pendingAppointments}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Completed Cases</p>
            <p className="text-lg font-semibold text-gray-900">
              {dischargedPatients + completedConsultations + completedAppointments}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-lg font-semibold text-gray-900">
              {totalRecords > 0
                ? Math.round(
                    ((dischargedPatients + completedConsultations + completedAppointments) /
                      totalRecords) *
                      100
                  )
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalSummary;