import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import DailyReports from '../DailyReports';
import LongStayReports from '../../components/Reports/LongStayReports';
import DepartmentStats from './DepartmentStats';

const UserReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('daily');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-gray-200 rounded-lg p-1">
          <TabsTrigger value="daily">Daily Reports</TabsTrigger>
          <TabsTrigger value="departments">Department Stats</TabsTrigger>
          <TabsTrigger value="long-stay">Long Stay Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <DailyReports />
        </TabsContent>

        <TabsContent value="departments">
          <DepartmentStats 
            dateFilter={{
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0],
              period: 'daily'
            }}
          />
        </TabsContent>

        <TabsContent value="long-stay">
          <LongStayReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserReports;