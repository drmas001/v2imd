export interface Doctor {
  id: number;
  medical_code: string;
  name: string;
  specialty_id: number;
  specialty_name?: string;
  active_patients?: number;
  is_available?: boolean;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface DoctorWorkload {
  doctor_id: number;
  doctor_name: string;
  medical_code: string;
  specialty: string;
  active_patients: number;
  pending_consultations: number;
  emergency_patients: number;
  avg_patient_stay: number;
}