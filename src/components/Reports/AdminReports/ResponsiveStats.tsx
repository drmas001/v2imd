import React from 'react';
import { Activity } from 'lucide-react';

interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: 'indigo' | 'green' | 'yellow' | 'red' | 'blue' | 'purple';
}

interface ResponsiveStatsProps {
  title?: string;
  stats: StatCard[];
}

const ResponsiveStats: React.FC<ResponsiveStatsProps> = ({ title, stats }) => {
  const getColorClasses = (color: StatCard['color'] = 'indigo') => {
    const classes = {
      indigo: 'bg-indigo-50 text-indigo-600',
      green: 'bg-green-50 text-green-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      red: 'bg-red-50 text-red-600',
      blue: 'bg-blue-50 text-blue-600',
      purple: 'bg-purple-50 text-purple-600'
    };
    return classes[color];
  };

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${getColorClasses(stat.color)}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              {stat.icon && (
                <div className={`p-2 rounded-lg bg-opacity-20 ${getColorClasses(stat.color)}`}>
                  {stat.icon}
                </div>
              )}
            </div>
            {typeof stat.change !== 'undefined' && (
              <div className="mt-2 text-sm">
                <span className={stat.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                </span>
                <span className="text-gray-600 ml-1">vs. previous period</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponsiveStats;