export interface ActivePatient {
  id: number;
  patient_id: number;
  mrn: string;
  name: string;
  admission_date: string;
  department: string;
  doctor_name: string | null;
  diagnosis: string;
  status: 'active' | 'discharged' | 'transferred';
  admitting_doctor_id: number | null;
  shift_type: 'morning' | 'evening' | 'night' | 'weekend_morning' | 'weekend_night';
  is_weekend: boolean;
  safety_type?: 'emergency' | 'observation' | 'short-stay';
  admitting_doctor?: {
    id: number;
    name: string;
    medical_code: string;
    role: 'doctor' | 'nurse' | 'administrator';
    department: string;
  } | null;
}