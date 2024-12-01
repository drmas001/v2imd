import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePatientStore } from '../../stores/usePatientStore';

const DepartmentOverview: React.FC = () => {
  const { patients } = usePatientStore();

  const departmentData = patients.reduce((acc, patient) => {
    const dept = patient.department || 'Unassigned';
    if (!acc[dept]) {
      acc[dept] = { total: 0, active: 0 };
    }
    acc[dept].total++;
    if (patient.admissions?.[0]?.status === 'active') {
      acc[dept].active++;
    }
    return acc;
  }, {} as Record<string, { total: number; active: number; }>);

  const data = Object.entries(departmentData).map(([name, stats]) => ({
    name,
    total: stats.total,
    active: stats.active,
    occupancy: Math.round((stats.active / stats.total) * 100)
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Department Overview</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={100}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="active" name="Active Patients" fill="#4f46e5" />
            <Bar dataKey="occupancy" name="Occupancy %" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DepartmentOverview;