export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  reportType: 'daily' | 'custom';
  specialty: string;
  searchQuery: string;
}

export interface ExportData {
  title?: string;
  patients: Array<{
    id: number;
    mrn: string;
    name: string;
    admission_date?: string;
    department?: string;
    doctor_name?: string | null;
    admissions?: Array<{
      status: string;
      admission_date: string;
      discharge_date?: string | null;
      department: string;
      diagnosis: string;
      visit_number: number;
      safety_type?: string;
      admitting_doctor?: {
        name: string;
      } | null;
    }>;
  }>;
  consultations: Array<{
    id: number;
    patient_name: string;
    mrn: string;
    consultation_specialty: string;
    created_at: string;
    urgency: string;
    status?: string;
    doctor_name?: string;
  }>;
  appointments: Array<{
    id: number;
    patientName: string;
    medicalNumber: string;
    specialty: string;
    appointmentType: string;
    createdAt: string;
    status: string;
  }>;
  dateFilter: {
    startDate: string;
    endDate: string;
    period: string;
  };
}

export interface Consultation {
  id: number;
  patient_id: number;
  patient_name: string;
  mrn: string;
  consultation_specialty: string;
  created_at: string;
  urgency: string;
  status: string;
  doctor_name: string;
  age: number;
  gender: string;
  requesting_department: string;
}