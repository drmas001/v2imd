import React, { useEffect } from 'react';
import { AlertCircle, Clock, Shield, Stethoscope } from 'lucide-react';
import { usePatientStore } from '../stores/usePatientStore';
import { useDischargeStore } from '../stores/useDischargeStore';
import { useConsultationStore } from '../stores/useConsultationStore';
import DischargeForm from '../components/Discharge/DischargeForm';
import DischargeSummary from '../components/Discharge/DischargeSummary';
import ConsultationDischarge from '../components/Discharge/ConsultationDischarge';
import { isLongStay } from '../utils/stayCalculator';
import SafetyBadge from '../components/PatientProfile/SafetyBadge';
import LongStayBadge from '../components/LongStay/LongStayBadge';
import type { Patient } from '../types/patient';
import type { Consultation } from '../types/consultation';

const PatientDischarge: React.FC = () => {
  const { patients, fetchPatients } = usePatientStore();
  const { consultations, fetchConsultations } = useConsultationStore();
  const { selectedPatient, setSelectedPatient } = useDischargeStore();

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchPatients(false),
        fetchConsultations()
      ]);
    };
    fetchData();
  }, [fetchPatients, fetchConsultations]);

  // Get active patients that can be discharged
  const activePatients = patients.filter(patient => 
    patient.admissions?.[0]?.status === 'active'
  );

  // Get active consultations for the selected patient
  const activeConsultations = selectedPatient 
    ? consultations.filter((consultation: Consultation) => 
        consultation.patient_id === selectedPatient.patient_id &&
        consultation.status === 'active'
      )
    : [];

  const handlePatientSelect = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient && patient.admissions?.[0]) {
      const admission = patient.admissions[0];
      setSelectedPatient({
        id: admission.id,
        patient_id: patient.id,
        mrn: patient.mrn,
        name: patient.name,
        admission_date: admission.admission_date,
        department: admission.department,
        doctor_name: admission.admitting_doctor?.name ?? null,
        diagnosis: admission.diagnosis,
        status: 'active',
        admitting_doctor_id: admission.admitting_doctor?.id ?? null,
        shift_type: admission.shift_type,
        is_weekend: admission.is_weekend,
        safety_type: admission.safety_type,
        admitting_doctor: admission.admitting_doctor ?? null
      });
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient Discharge</h1>
        <p className="text-gray-600">Process patient discharge and create discharge summary</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Active Patients</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {activePatients.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No active patients to discharge
                </div>
              ) : (
                activePatients.map((patient) => {
                  const admission = patient.admissions?.[0];
                  const isLongStayPatient = patient.admission_date ? isLongStay(patient.admission_date) : false;
                  const patientConsultations = consultations.filter(
                    c => c.patient_id === patient.id && c.status === 'active'
                  );

                  return (
                    <button
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedPatient?.patient_id === patient.id ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{patient.name}</h3>
                            <p className="text-sm text-gray-600">MRN: {patient.mrn}</p>
                            {patientConsultations.length > 0 && (
                              <div className="mt-1 flex items-center space-x-1">
                                <Stethoscope className="h-4 w-4 text-indigo-600" />
                                <span className="text-sm text-indigo-600">
                                  {patientConsultations.length} active consultation{patientConsultations.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            {admission?.safety_type && (
                              <SafetyBadge type={admission.safety_type} />
                            )}
                            {isLongStayPatient && patient.admission_date && (
                              <LongStayBadge 
                                admissionDate={patient.admission_date}
                                showDuration={true}
                              />
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Department: {patient.department}</p>
                          <p>Doctor: {admission?.admitting_doctor?.name ?? 'Not assigned'}</p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="space-y-6">
              {activeConsultations.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Stethoscope className="h-5 w-5 text-indigo-600" />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Active Consultations</h2>
                      <p className="text-sm text-gray-600">
                        Complete all consultations before discharging the patient
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {activeConsultations.map(consultation => (
                      <ConsultationDischarge 
                        key={consultation.id}
                        consultation={consultation}
                      />
                    ))}
                  </div>
                </div>
              )}

              <DischargeForm />
              <DischargeSummary />
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">
                    No Patient Selected
                  </h3>
                  <p className="text-yellow-700">
                    Please select an active patient from the list to process their discharge.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDischarge;