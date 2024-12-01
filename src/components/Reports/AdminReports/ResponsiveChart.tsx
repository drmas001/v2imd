import React from 'react';
import { ResponsiveContainer } from 'recharts';

interface ResponsiveChartProps {
  title: string;
  subtitle?: string;
  height?: number;
  children: React.ReactElement;
}

const ResponsiveChart: React.FC<ResponsiveChartProps> = ({
  title,
  subtitle,
  height = 400,
  children
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      <div className="h-[300px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {React.cloneElement(children)}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ResponsiveChart;