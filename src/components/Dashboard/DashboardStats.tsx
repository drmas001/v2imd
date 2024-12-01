import React from 'react';
import { Users, Stethoscope, Activity, Calendar } from 'lucide-react';
import { usePatientStore } from '../../stores/usePatientStore';
import { useConsultationStore } from '../../stores/useConsultationStore';
import { useAppointmentStore } from '../../stores/useAppointmentStore';
import StatCard from './StatCard';
import DepartmentOverview from './DepartmentOverview';
import ConsultationOverview from './ConsultationOverview';
import SafetyOverview from './SafetyOverview';

const DashboardStats: React.FC = () => {
  const { patients } = usePatientStore();
  const { consultations } = useConsultationStore();
  const { appointments } = useAppointmentStore();
  
  // Get active patients count
  const activePatients = patients.filter(patient => 
    patient.admissions?.[0]?.status === 'active'
  ).length;

  // Get active consultations count
  const activeConsultations = consultations.filter(consultation =>
    consultation.status === 'active'
  ).length;

  // Get pending appointments count
  const pendingAppointments = appointments.filter(appointment =>
    appointment.status === 'pending'
  ).length;

  // Calculate total active cases
  const totalCases = activePatients + activeConsultations;

  const stats = [
    {
      title: 'Active Patients',
      value: activePatients,
      icon: Users,
      color: 'indigo' as const,
      description: 'Currently admitted patients'
    },
    {
      title: 'Active Consultations',
      value: activeConsultations,
      icon: Stethoscope,
      color: 'green' as const,
      description: 'Pending medical consultations'
    },
    {
      title: 'Pending Appointments',
      value: pendingAppointments,
      icon: Calendar,
      color: 'blue' as const,
      description: 'Scheduled clinic appointments'
    },
    {
      title: 'Total Cases',
      value: totalCases,
      icon: Activity,
      color: 'purple' as const,
      description: 'Combined active cases'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            description={stat.description}
          />
        ))}
      </div>

      {/* Overview Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepartmentOverview />
        <ConsultationOverview />
      </div>

      {/* Safety Overview */}
      <SafetyOverview />
    </div>
  );
};

export default DashboardStats;