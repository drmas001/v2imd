import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ExportButton } from '../../components/Reports/ExportButton';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { usePatientStore } from '../../stores/usePatientStore';
import { useConsultationStore } from '../../stores/useConsultationStore';
import DoctorStats from './DoctorStats';
import SpecialtyStats from './SpecialtyStats';
import SafetyAdmissionStats from './SafetyStats/SafetyAdmissionStats';
import DischargeStats from './DischargeStats';
import OccupancyChart from './OccupancyChart';
import AdmissionTrends from './AdmissionTrends';
import ConsultationMetrics from './ConsultationMetrics';
import LongStayReport from '../../components/LongStay/LongStayReport';
import { useUserStore } from '../../stores/useUserStore';
import { AccessDenied } from '../../components/ui/AccessDenied';
import { PrinterIcon } from '@heroicons/react/24/outline';

const AdminReports: React.FC = () => {
  const { currentUser } = useUserStore();
  const { patients } = usePatientStore();
  const { consultations } = useConsultationStore();
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    period: 'today' as 'today' | 'week' | 'month' | 'custom'
  });

  // Check if user has admin access
  if (currentUser?.role !== 'administrator') {
    return <AccessDenied />;
  }

  const exportData = {
    patients,
    consultations,
    dateFilter,
    appointments: []
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Administrative Report</CardTitle>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => window.print()}
                leftIcon={<PrinterIcon className="h-4 w-4" />}
              >
                Print
              </Button>
              <ExportButton data={exportData} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DateRangePicker
            value={dateFilter}
            onChange={setDateFilter}
            className="mb-6"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OccupancyChart dateFilter={dateFilter} />
            <AdmissionTrends dateFilter={dateFilter} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <SpecialtyStats 
              patients={patients} 
              consultations={consultations} 
            />
            <DoctorStats dateFilter={dateFilter} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <ConsultationMetrics dateFilter={dateFilter} />
            <SafetyAdmissionStats dateFilter={dateFilter} />
          </div>

          <div className="mt-6">
            <DischargeStats dateFilter={dateFilter} />
          </div>

          <div className="mt-6">
            <LongStayReport dateFilter={dateFilter} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;