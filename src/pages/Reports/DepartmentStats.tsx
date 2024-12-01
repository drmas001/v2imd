import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { usePatientStore } from '../../stores/usePatientStore';
import { useConsultationStore } from '../../stores/useConsultationStore';
import type { Patient } from '../../types/patient';
import type { Consultation } from '../../types/consultation';

interface DepartmentStatsProps {
  dateFilter: {
    startDate: string;
    endDate: string;
    period: string;
  };
}

const departments = [
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

const DepartmentStats: React.FC<DepartmentStatsProps> = ({ dateFilter }) => {
  const { patients } = usePatientStore();
  const { consultations } = useConsultationStore();

  const getDepartmentData = () => {
    return departments.map(department => {
      // Count active patients in this department
      const activePatients = patients.filter((patient: Patient) => 
        patient.admissions?.some(admission => 
          admission.department === department && 
          admission.status === 'active' &&
          new Date(admission.admission_date) >= new Date(dateFilter.startDate) &&
          new Date(admission.admission_date) <= new Date(dateFilter.endDate)
        )
      ).length;

      // Count active consultations for this department
      const activeConsultations = consultations.filter((consultation: Consultation) =>
        consultation.consultation_specialty === department &&
        consultation.status === 'active' &&
        new Date(consultation.created_at) >= new Date(dateFilter.startDate) &&
        new Date(consultation.created_at) <= new Date(dateFilter.endDate)
      ).length;

      // Calculate occupancy rate (assuming each department has 10 beds)
      const occupancyRate = Math.min(100, Math.round((activePatients / 10) * 100));

      return {
        name: department,
        patients: activePatients,
        consultations: activeConsultations,
        occupancyRate
      };
    });
  };

  const data = getDepartmentData();
  const totalPatients = data.reduce((sum, dept) => sum + dept.patients, 0);
  const totalConsultations = data.reduce((sum, dept) => sum + dept.consultations, 0);
  const averageOccupancy = Math.round(data.reduce((sum, dept) => sum + dept.occupancyRate, 0) / departments.length);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Activity className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Department Statistics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-indigo-50 rounded-lg">
          <p className="text-sm font-medium text-indigo-600">Total Active Patients</p>
          <p className="text-2xl font-bold text-indigo-900">{totalPatients}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-green-600">Active Consultations</p>
          <p className="text-2xl font-bold text-green-900">{totalConsultations}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-600">Average Occupancy</p>
          <p className="text-2xl font-bold text-blue-900">{averageOccupancy}%</p>
        </div>
      </div>

      <div className="h-[400px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="patients" 
              name="Active Patients" 
              fill="#4f46e5" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="consultations" 
              name="Active Consultations" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="occupancyRate" 
              name="Occupancy Rate %" 
              fill="#6366f1" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map(department => (
          <div 
            key={department.name}
            className="p-4 bg-gray-50 rounded-lg"
          >
            <h4 className="font-medium text-gray-900 mb-2">{department.name}</h4>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">
                Active Patients: <span className="font-medium text-gray-900">{department.patients}</span>
              </p>
              <p className="text-gray-600">
                Consultations: <span className="font-medium text-gray-900">{department.consultations}</span>
              </p>
              <p className="text-gray-600">
                Occupancy: <span className="font-medium text-gray-900">{department.occupancyRate}%</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentStats;