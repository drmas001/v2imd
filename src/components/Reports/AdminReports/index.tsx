import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { ExportButton } from '../ExportButton';
import { DateRangePicker } from '../../ui/DateRangePicker';
import { usePatientStore } from '../../../stores/usePatientStore';
import { useConsultationStore } from '../../../stores/useConsultationStore';
import type { DoctorData, DoctorStatsProps } from '../../../pages/Reports/DoctorStats';
import SpecialtyStats from '../../../components/Reports/SpecialtyStats';
import SafetyAdmissionStats from '../../../components/Reports/SafetyAdmissionStats';
import DischargeStats from '../../../components/Reports/DischargeStats';
import OccupancyChart from '../../../components/Reports/OccupancyChart';
import AdmissionTrends from '../../../components/Reports/AdmissionTrends';
import ConsultationMetrics from '../../../components/Reports/ConsultationMetrics';
import LongStayReport from '../../LongStay/LongStayReport';
import { useUserStore } from '../../../stores/useUserStore';
import { AccessDenied } from '../../ui/AccessDenied';
import type { ExportData } from '../../../types/report';
import DoctorStats from '../../../components/Reports/DoctorStats';

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

  const exportData: ExportData = {
    title: 'IMD-Care Administrative Report',
    patients: patients.map(patient => ({
      id: patient.id,
      mrn: patient.mrn,
      name: patient.name,
      admission_date: patient.admission_date,
      department: patient.department,
      doctor_name: patient.doctor_name,
      admissions: patient.admissions?.map(admission => ({
        status: admission.status,
        admission_date: admission.admission_date,
        discharge_date: admission.discharge_date,
        department: admission.department,
        diagnosis: admission.diagnosis,
        visit_number: admission.visit_number,
        safety_type: admission.safety_type,
        admitting_doctor: admission.admitting_doctor ? {
          name: admission.admitting_doctor.name
        } : undefined
      }))
    })),
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
            onChange={(value) => setDateFilter(value)}
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