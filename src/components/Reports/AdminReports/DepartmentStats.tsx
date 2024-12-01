import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ResponsiveChart from './ResponsiveChart';
import type { Patient } from '../../../types/patient';
import type { Consultation } from '../../../types/consultation';

interface DepartmentStatsProps {
  patients: Patient[];
  consultations: Consultation[];
  dateFilter: {
    startDate: string;
    endDate: string;
    period: string;
  };
}

const DepartmentStats: React.FC<DepartmentStatsProps> = ({ patients, consultations, dateFilter }) => {
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
  ];

  const getDepartmentData = () => {
    return departments.map(department => {
      const deptPatients = patients.filter(patient => 
        patient.department === department &&
        new Date(patient.admission_date || '') >= new Date(dateFilter.startDate) &&
        new Date(patient.admission_date || '') <= new Date(dateFilter.endDate)
      );

      const deptConsultations = consultations.filter(consultation =>
        consultation.consultation_specialty === department &&
        new Date(consultation.created_at) >= new Date(dateFilter.startDate) &&
        new Date(consultation.created_at) <= new Date(dateFilter.endDate)
      );

      return {
        name: department,
        patients: deptPatients.length,
        consultations: deptConsultations.length
      };
    });
  };

  return (
    <ResponsiveChart title="Department Statistics" subtitle="Patient distribution by department">
      <BarChart data={getDepartmentData()}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="patients" name="Patients" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        <Bar dataKey="consultations" name="Consultations" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveChart>
  );
};

export default DepartmentStats;