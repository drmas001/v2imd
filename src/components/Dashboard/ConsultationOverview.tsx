import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useConsultationStore } from '../../stores/useConsultationStore';

const COLORS = {
  emergency: '#ef4444',
  urgent: '#f59e0b',
  routine: '#10b981'
} as const;

const ConsultationOverview: React.FC = () => {
  const { consultations } = useConsultationStore();

  const activeConsultations = consultations.filter(c => c.status === 'active');

  const data = [
    { name: 'Emergency', value: activeConsultations.filter(c => c.urgency === 'emergency').length },
    { name: 'Urgent', value: activeConsultations.filter(c => c.urgency === 'urgent').length },
    { name: 'Routine', value: activeConsultations.filter(c => c.urgency === 'routine').length }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Active Consultations</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} 
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConsultationOverview;