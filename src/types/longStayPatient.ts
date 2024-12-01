export interface LongStayPatient {
  id: number;
  mrn: string;
  name: string;
  gender: 'male' | 'female';
  date_of_birth: string;
  department: string;
  admission_date: string;
  doctor_name?: string | null;
  diagnosis: string;
  safety_type?: 'emergency' | 'observation' | 'short-stay';
  admitting_doctor?: {
    id: number;
    name: string;
    medical_code: string;
    role: 'doctor' | 'nurse' | 'administrator';
    department: string;
  } | null;
  stay_duration: number;
  notes_count: number;
  admissions?: Array<{
    id: number;
    patient_id: number;
    admission_date: string;
    discharge_date?: string | null;
    department: string;
    diagnosis: string;
    status: 'active' | 'discharged' | 'transferred';
    visit_number: number;
    safety_type?: 'emergency' | 'observation' | 'short-stay';
    admitting_doctor?: {
      id: number;
      name: string;
      medical_code: string;
      role: 'doctor' | 'nurse' | 'administrator';
      department: string;
    } | null;
  }>;
}