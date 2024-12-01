import React from 'react';
import { Users, UserPlus, Activity, Map } from 'lucide-react';
import ResponsiveStats from './ResponsiveStats';
import ResponsiveChart from './ResponsiveChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useUserStore } from '../../../stores/useUserStore';
import { format } from 'date-fns';

const UserAnalytics: React.FC = () => {
  const { users } = useUserStore();

  // Calculate user statistics
  const activeUsers = users.filter(user => user.status === 'active').length;
  const inactiveUsers = users.filter(user => user.status === 'inactive').length;
  const totalUsers = users.length;

  // Calculate user roles distribution
  const roleDistribution = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: <Users className="h-5 w-5" />,
      color: 'indigo' as const
    },
    {
      title: 'Active Users',
      value: activeUsers,
      icon: <Activity className="h-5 w-5" />,
      color: 'green' as const
    },
    {
      title: 'New Users (30d)',
      value: users.filter(user => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(user.created_at || '') > thirtyDaysAgo;
      }).length,
      icon: <UserPlus className="h-5 w-5" />,
      color: 'blue' as const
    },
    {
      title: 'Departments',
      value: new Set(users.map(user => user.department)).size,
      icon: <Map className="h-5 w-5" />,
      color: 'purple' as const
    }
  ];

  // Prepare data for role distribution chart
  const roleData = Object.entries(roleDistribution).map(([role, count]) => ({
    role: role.charAt(0).toUpperCase() + role.slice(1),
    count
  }));

  // Prepare data for user activity chart (last 7 days)
  const activityData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = format(date, 'MMM dd');
    
    return {
      date: dateStr,
      logins: Math.floor(Math.random() * 50), // Replace with actual login data
      actions: Math.floor(Math.random() * 100) // Replace with actual action data
    };
  }).reverse();

  return (
    <div className="space-y-6">
      <ResponsiveStats title="User Overview" stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponsiveChart title="Role Distribution" subtitle="Users by role">
          <BarChart data={roleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="role" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Users" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveChart>

        <ResponsiveChart title="User Activity" subtitle="Last 7 days">
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="logins" name="Logins" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actions" name="Actions" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveChart>
      </div>
    </div>
  );
};

export default UserAnalytics;