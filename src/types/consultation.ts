export interface Consultation {
  id: number;
  patient_id: number;
  mrn: string;
  patient_name: string;
  age: number;
  gender: 'male' | 'female';
  requesting_department: string;
  patient_location: string;
  consultation_specialty: string;
  shift_type: 'morning' | 'evening' | 'night';
  urgency: 'routine' | 'urgent' | 'emergency';
  reason: string;
  status: 'active' | 'completed' | 'cancelled';
  doctor_id?: number;
  doctor_name?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  completed_by?: number;
  completion_note?: string;
  response_time?: number;
  doctor?: {
    id: number;
    name: string;
    medical_code: string;
    role: 'doctor' | 'nurse' | 'administrator';
    department: string;
  };
  completed_by_user?: {
    id: number;
    name: string;
    medical_code: string;
    role: 'doctor' | 'nurse' | 'administrator';
    department: string;
  };
}