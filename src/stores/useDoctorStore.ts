import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Doctor, DoctorWorkload } from '../types/doctor';

interface DoctorData {
  id: number;
  medical_code: string;
  name: string;
  specialty_id: number;
  status: 'active' | 'inactive';
  specialty: {
    name: string;
  };
}

interface DoctorStore {
  doctors: Doctor[];
  workloadStats: DoctorWorkload[];
  loading: boolean;
  error: string | null;
  fetchDoctors: (specialtyName?: string) => Promise<void>;
  fetchWorkloadStats: () => Promise<void>;
  assignDoctor: (admissionId: number, doctorId: number, isDischarge?: boolean) => Promise<boolean>;
}

export const useDoctorStore = create<DoctorStore>((set, get) => ({
  doctors: [],
  workloadStats: [],
  loading: false,
  error: null,

  fetchDoctors: async (specialtyName?: string) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('users')
        .select(`
          id,
          medical_code,
          name,
          specialty_id,
          status,
          specialty (
            name
          )
        `)
        .eq('role', 'doctor')
        .eq('status', 'active');

      if (specialtyName) {
        query = query.eq('specialty.name', specialtyName);
      }

      const { data, error } = await query;

      if (error) throw error;

      const doctors: Doctor[] = (data as unknown as DoctorData[]).map(doctor => ({
        id: doctor.id,
        medical_code: doctor.medical_code,
        name: doctor.name,
        specialty_id: doctor.specialty_id,
        specialty_name: doctor.specialty?.name,
        status: doctor.status,
        active_patients: 0,
        is_available: true
      }));

      set({ doctors, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch doctors', 
        loading: false 
      });
    }
  },

  fetchWorkloadStats: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('doctor_workload_stats')
        .select('*');

      if (error) throw error;

      const workloadStats = data.map((stat): DoctorWorkload => ({
        doctor_id: stat.doctor_id,
        doctor_name: stat.doctor_name,
        medical_code: stat.medical_code,
        specialty: stat.specialty,
        active_patients: stat.active_patients,
        pending_consultations: stat.pending_consultations,
        emergency_patients: stat.emergency_patients,
        avg_patient_stay: stat.avg_patient_stay
      }));

      set({ workloadStats, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch workload stats', 
        loading: false 
      });
    }
  },

  assignDoctor: async (admissionId: number, doctorId: number, isDischarge = false) => {
    try {
      const { data, error } = await supabase
        .rpc('assign_doctor_to_admission', {
          admission_id: admissionId,
          doctor_id: doctorId,
          is_discharge: isDischarge
        });

      if (error) throw error;

      // Refresh doctor stats after assignment
      await get().fetchWorkloadStats();

      return data as boolean;
    } catch (error) {
      console.error('Error assigning doctor:', error);
      return false;
    }
  }
}));