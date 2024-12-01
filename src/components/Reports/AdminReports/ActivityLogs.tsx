import React, { useState } from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import ResponsiveTable from './ResponsiveTable';
import { format } from 'date-fns';

interface ActivityLog {
  id: number;
  user: string;
  action: string;
  details: string;
  timestamp: string;
  eventType: 'login' | 'system' | 'security';
}

const ActivityLogs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: format(new Date().setDate(new Date().getDate() - 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  // Mock data - replace with actual activity logs from your system
  const mockLogs: ActivityLog[] = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    user: `User ${i + 1}`,
    action: ['Login', 'Logout', 'Update Profile', 'Access Report'][Math.floor(Math.random() * 4)],
    details: 'Action details here',
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    eventType: ['login', 'system', 'security'][Math.floor(Math.random() * 3)] as ActivityLog['eventType']
  }));

  // Filter logs based on search, event type, and date range
  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEventType = eventFilter === 'all' || log.eventType === eventFilter;
    
    const logDate = new Date(log.timestamp);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    
    const matchesDateRange = logDate >= startDate && logDate <= endDate;

    return matchesSearch && matchesEventType && matchesDateRange;
  });

  const getEventTypeColor = (type: ActivityLog['eventType']) => {
    switch (type) {
      case 'login':
        return 'bg-blue-100 text-blue-800';
      case 'system':
        return 'bg-green-100 text-green-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tableRows = filteredLogs.map(log => ({
    id: log.id,
    cells: [
      { label: 'Timestamp', value: format(new Date(log.timestamp), 'dd MMM yyyy HH:mm:ss') },
      { 
        label: 'Event Type', 
        value: (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(log.eventType)}`}>
            {log.eventType.charAt(0).toUpperCase() + log.eventType.slice(1)}
          </span>
        )
      },
      { label: 'User', value: log.user },
      { label: 'Action', value: log.action },
      { label: 'Details', value: log.details }
    ]
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
          >
            <option value="all">All Events</option>
            <option value="login">Login Events</option>
            <option value="system">System Events</option>
            <option value="security">Security Events</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <ResponsiveTable
        headers={['Timestamp', 'Event Type', 'User', 'Action', 'Details']}
        rows={tableRows}
      />
    </div>
  );
};

export default ActivityLogs;