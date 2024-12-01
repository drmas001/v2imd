import React from 'react';
import { Server, AlertCircle, Clock, Database } from 'lucide-react';
import ResponsiveStats from './ResponsiveStats';
import ResponsiveChart from './ResponsiveChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';

const SystemMetrics: React.FC = () => {
  // Mock data - replace with actual metrics from your monitoring system
  const stats = [
    {
      title: 'Avg Response Time',
      value: '245ms',
      icon: <Clock className="h-5 w-5" />,
      color: 'indigo' as const,
      change: -12
    },
    {
      title: 'Error Rate',
      value: '0.05%',
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'red' as const,
      change: -5
    },
    {
      title: 'Server Uptime',
      value: '99.99%',
      icon: <Server className="h-5 w-5" />,
      color: 'green' as const
    },
    {
      title: 'DB Queries/sec',
      value: '856',
      icon: <Database className="h-5 w-5" />,
      color: 'blue' as const,
      change: 8
    }
  ];

  // Mock performance data - replace with actual metrics
  const performanceData = Array.from({ length: 24 }, (_, i) => {
    const hour = format(new Date().setHours(i), 'HH:mm');
    return {
      time: hour,
      responseTime: Math.floor(200 + Math.random() * 100),
      errorRate: Math.random() * 0.1,
      queries: Math.floor(800 + Math.random() * 200)
    };
  });

  return (
    <div className="space-y-6">
      <ResponsiveStats title="System Performance" stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponsiveChart 
          title="Response Times" 
          subtitle="Average response time (ms) over 24 hours"
        >
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="responseTime" 
              name="Response Time (ms)" 
              stroke="#4f46e5" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveChart>

        <ResponsiveChart 
          title="Database Load" 
          subtitle="Queries per second over 24 hours"
        >
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="queries" 
              name="Queries/sec" 
              stroke="#10b981" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveChart>
      </div>
    </div>
  );
};

export default SystemMetrics;