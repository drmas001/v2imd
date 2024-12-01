export interface Admission {
  id: number;
  patient_id: number;
  admission_date: string;
  discharge_date: string | null;
  department: string;
  diagnosis: string;
  status: 'active' | 'discharged' | 'transferred';
  visit_number: number;
  safety_type?: 'emergency' | 'observation' | 'short-stay';
  shift_type: 'morning' | 'evening' | 'night' | 'weekend_morning' | 'weekend_night';
  is_weekend: boolean;
  admitting_doctor_id: number | null;
  discharge_doctor_id?: number | null;
  admitting_doctor?: {
    id: number;
    name: string;
    medical_code: string;
    role: 'doctor' | 'nurse' | 'administrator';
    department: string;
  } | null;
  discharge_doctor?: {
    id: number;
    name: string;
    medical_code: string;
    role: 'doctor' | 'nurse' | 'administrator';
    department: string;
  } | null;
}