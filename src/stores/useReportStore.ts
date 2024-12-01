import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { ReportFilters } from '../types/report';
import type { Patient } from '../types/patient';
import type { Consultation } from '../types/consultation';
import type { Appointment } from '../types/appointment';

interface ReportData {
  patients: Array<{
    id: number;
    mrn: string;
    name: string;
    admission_date?: string;
    department?: string;
    doctor_name: string;
    admissions?: Array<{
      status: string;
      admission_date: string;
      discharge_date?: string | null;
      department: string;
      diagnosis: string;
      visit_number: number;
      safety_type?: 'emergency' | 'observation' | 'short-stay';
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
}

interface ReportStore {
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  fetchReportData: (filters: ReportFilters) => Promise<ReportData>;
}

interface AdmissionResponse {
  id: number;
  patient_id: number;
  admission_date: string;
  discharge_date: string | null;
  department: string;
  diagnosis: string;
  status: string;
  safety_type?: 'emergency' | 'observation' | 'short-stay';
  visit_number: number;
  patients: {
    id: number;
    mrn: string;
    name: string;
  };
  admitting_doctor?: {
    id: number;
    name: string;
  } | null;
}

export const useReportStore = create<ReportStore>((set) => ({
  loading: false,
  error: null,
  lastRefresh: null,

  fetchReportData: async (filters: ReportFilters) => {
    set({ loading: true, error: null });
    try {
      const dateFrom = new Date(filters.dateFrom);
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999);

      // Fetch patients with admissions
      const { data: patientsData, error: patientsError } = await supabase
        .from('admissions')
        .select(`
          id,
          patient_id,
          admission_date,
          discharge_date,
          department,
          diagnosis,
          status,
          safety_type,
          visit_number,
          patients!inner (
            id,
            mrn,
            name
          ),
          admitting_doctor:users!admissions_admitting_doctor_id_fkey (
            id,
            name
          )
        `)
        .gte('admission_date', dateFrom.toISOString())
        .lte('admission_date', dateTo.toISOString());

      if (patientsError) throw patientsError;

      // Fetch consultations
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select(`
          id,
          patient_name,
          mrn,
          consultation_specialty,
          created_at,
          urgency,
          doctor:users!consultations_doctor_id_fkey (
            name
          )
        `)
        .gte('created_at', dateFrom.toISOString())
        .lte('created_at', dateTo.toISOString());

      if (consultationsError) throw consultationsError;

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .gte('created_at', dateFrom.toISOString())
        .lte('created_at', dateTo.toISOString());

      if (appointmentsError) throw appointmentsError;

      // Transform data to match ReportData interface
      const patients = (patientsData as unknown as AdmissionResponse[]).map(admission => ({
        id: admission.patients.id,
        mrn: admission.patients.mrn,
        name: admission.patients.name,
        admission_date: admission.admission_date,
        department: admission.department,
        doctor_name: admission.admitting_doctor?.name || '',
        admissions: [{
          status: admission.status,
          admission_date: admission.admission_date,
          discharge_date: admission.discharge_date,
          department: admission.department,
          diagnosis: admission.diagnosis,
          visit_number: admission.visit_number,
          safety_type: admission.safety_type || undefined,
          admitting_doctor: admission.admitting_doctor ? {
            name: admission.admitting_doctor.name
          } : null
        }]
      }));

      const consultations = (consultationsData || []).map(consultation => ({
        id: consultation.id,
        patient_name: consultation.patient_name,
        mrn: consultation.mrn,
        consultation_specialty: consultation.consultation_specialty,
        created_at: consultation.created_at,
        urgency: consultation.urgency,
      }));

      const appointments = (appointmentsData || []).map(appointment => ({
        id: appointment.id,
        patientName: appointment.patient_name,
        medicalNumber: appointment.medical_number,
        specialty: appointment.specialty,
        appointmentType: appointment.appointment_type,
        createdAt: appointment.created_at,
        status: appointment.status
      }));

      // Apply specialty filter if specified
      const filteredData = {
        patients: filters.specialty === 'all' 
          ? patients 
          : patients.filter(p => p.department === filters.specialty),
        consultations: filters.specialty === 'all'
          ? consultations
          : consultations.filter(c => c.consultation_specialty === filters.specialty),
        appointments: filters.specialty === 'all'
          ? appointments
          : appointments.filter(a => a.specialty === filters.specialty)
      };

      // Apply search filter if specified
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredData.patients = filteredData.patients.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.mrn.toLowerCase().includes(query) ||
          p.doctor_name.toLowerCase().includes(query)
        );
        filteredData.consultations = filteredData.consultations.filter(c =>
          c.patient_name.toLowerCase().includes(query) ||
          c.mrn.toLowerCase().includes(query)
        );
        filteredData.appointments = filteredData.appointments.filter(a =>
          a.patientName.toLowerCase().includes(query) ||
          a.medicalNumber.toLowerCase().includes(query)
        );
      }

      set({ lastRefresh: new Date(), loading: false });
      return filteredData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch report data';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  }
}));