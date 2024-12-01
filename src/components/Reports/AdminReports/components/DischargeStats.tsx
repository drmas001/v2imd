import React from 'react';
import { usePatientStore } from '../../../../stores/usePatientStore';
import { formatDate } from '../../../../utils/dateFormat';

interface DischargeStatsProps {
  dateFilter: {
    startDate: string;
    endDate: string;
    period: string;
  };
}

const DischargeStats: React.FC<DischargeStatsProps> = ({ dateFilter }) => {
  const { patients } = usePatientStore();

  const dischargedPatients = patients.filter(patient =>
    patient.admissions?.some(admission =>
      admission.status === 'discharged' &&
      admission.discharge_date &&
      new Date(admission.discharge_date) >= new Date(dateFilter.startDate) &&
      new Date(admission.discharge_date) <= new Date(dateFilter.endDate)
    )
  );

  const totalDischarges = dischargedPatients.length;
  const averageStay = totalDischarges > 0
    ? Math.round(dischargedPatients.reduce((sum, patient) => {
        const admission = patient.admissions?.[0];
        if (!admission?.discharge_date) return sum;
        const days = Math.ceil(
          (new Date(admission.discharge_date).getTime() - new Date(admission.admission_date).getTime()) /
          (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0) / totalDischarges)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Discharge Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-indigo-50 rounded-lg">
          <p className="text-sm font-medium text-indigo-600">Total Discharges</p>
          <p className="text-2xl font-bold text-indigo-900">{totalDischarges}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-green-600">Average Length of Stay</p>
          <p className="text-2xl font-bold text-green-900">{averageStay} days</p>
        </div>
      </div>

      {dischargedPatients.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Recent Discharges</h3>
          <div className="space-y-4">
            {dischargedPatients.slice(0, 5).map(patient => {
              const admission = patient.admissions?.[0];
              return (
                <div key={patient.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-600">MRN: {patient.mrn}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Discharged: {admission?.discharge_date ? formatDate(admission.discharge_date) : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Department: {admission?.department}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DischargeStats;