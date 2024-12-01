import { Patient } from '../patient';
import { Consultation } from '../consultation';

export interface SpecialtyStats extends React.FC<{
  patients: Patient[];
  consultations: Consultation[];
}> {}

export interface SpecialtyData {
  name: string;
  count: number;
  percentage: number;
}

export interface SpecialtyBreakdown {
  specialty: string;
  patientCount: number;
  consultationCount: number;
}

export interface SpecialtyMetrics {
  totalPatients: number;
  totalConsultations: number;
  breakdown: SpecialtyBreakdown[];
}