import React from 'react';
import { User, Stethoscope, FileText, Calendar, Shield, Clock } from 'lucide-react';
import { usePatientStore } from '../../stores/usePatientStore';
import { formatDate } from '../../utils/dateFormat';
import { isLongStay } from '../../utils/stayCalculator';
import DoctorDisplay from '../DoctorDisplay';
import SafetyBadge from './SafetyBadge';
import LongStayBadge from '../LongStay/LongStayBadge';
import type { Admission } from '../../types/admission';

const PatientInfo: React.FC = () => {
  const { selectedPatient } = usePatientStore();

  if (!selectedPatient) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <User className="h-12 w-12 mx-auto mb-2" />
          <p>Select a patient to view details</p>
        </div>
      </div>
    );
  }

  const activeAdmission = selectedPatient.admissions?.[0] as Admission | undefined;
  const admissionDate = activeAdmission?.admission_date;
  const isLongStayPatient = admissionDate ? isLongStay(admissionDate) : false;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Patient Basic Info */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{selectedPatient.name}</h2>
          <p className="text-sm text-gray-600">MRN: {selectedPatient.mrn}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          {activeAdmission?.safety_type && (
            <SafetyBadge type={activeAdmission.safety_type} />
          )}
          {isLongStayPatient && admissionDate && (
            <LongStayBadge 
              admissionDate={admissionDate}
              showDuration={true}
            />
          )}
        </div>
      </div>

      {/* Admission Details */}
      {activeAdmission && (
        <>
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Admission Date</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(activeAdmission.admission_date)}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Stethoscope className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="text-sm font-medium text-gray-900">{activeAdmission.department}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <DoctorDisplay 
                doctor={activeAdmission.admitting_doctor}
                label="Assigned Doctor"
              />
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Diagnosis</p>
              <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">
                {activeAdmission.diagnosis}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Visit Number</p>
              <p className="text-sm font-medium text-gray-900">#{activeAdmission.visit_number}</p>
            </div>
          </div>
        </>
      )}

      {/* Status Badge */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            activeAdmission?.status === 'active'
              ? 'bg-green-100 text-green-800'
              : activeAdmission?.status === 'discharged'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {activeAdmission?.status || 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PatientInfo;