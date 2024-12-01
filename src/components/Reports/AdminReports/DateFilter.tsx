import React from 'react';
import { Filter, Calendar } from 'lucide-react';

interface DateFilterProps {
  dateFilter: {
    startDate: string;
    endDate: string;
    period: 'today' | 'week' | 'month' | 'custom';
  };
  onPeriodChange: (period: string) => void;
  onDateChange: (type: 'startDate' | 'endDate', value: string) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({
  dateFilter,
  onPeriodChange,
  onDateChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Period
        </label>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={dateFilter.period}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {dateFilter.period === 'custom' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => onDateChange('startDate', e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => onDateChange('endDate', e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DateFilter;