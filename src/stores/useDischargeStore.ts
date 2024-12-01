import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useUserStore } from './useUserStore';
import { useMedicalNotesStore } from './useMedicalNotesStore';
import { useLongStayStore } from './useLongStayStore';
import type { DischargeData } from '../types/discharge';
import type { ActivePatient } from '../types/activePatient';

interface AdmissionData {
  id: number;
  patient_id: number;
  admission_date: string;
  department: string;
  diagnosis: string;
  status: 'active' | 'discharged' | 'transferred';
  admitting_doctor_id: number | null;
  shift_type: 'morning' | 'evening' | 'night' | 'weekend_morning' | 'weekend_night';
  is_weekend: boolean;
  safety_type: 'emergency' | 'observation' | 'short-stay' | null;
  patients: {
    mrn: string;
    name: string;
  };
  admitting_doctor?: {
    id: number;
    name: string;
    medical_code: string;
    role: 'doctor' | 'nurse' | 'administrator';
    department: string;
  } | null;
}

interface DischargeStore {
  activePatients: ActivePatient[];
  loading: boolean;
  error: string | null;
  selectedPatient: ActivePatient | null;
  fetchActivePatients: () => Promise<void>;
  setSelectedPatient: (patient: ActivePatient | null) => void;
  processDischarge: (data: DischargeData) => Promise<void>;
}

export const useDischargeStore = create<DischargeStore>((set, get) => ({
  activePatients: [],
  loading: false,
  error: null,
  selectedPatient: null,

  fetchActivePatients: async () => {
    set({ loading: true, error: null });
    try {
      const { data: admissionsData, error: admissionsError } = await supabase
        .from('admissions')
        .select(`
          id,
          patient_id,
          admission_date,
          department,
          diagnosis,
          status,
          admitting_doctor_id,
          shift_type,
          is_weekend,
          safety_type,
          patients!inner (
            mrn,
            name
          ),
          admitting_doctor:users!admissions_admitting_doctor_id_fkey (
            id,
            name,
            medical_code,
            role,
            department
          )
        `)
        .eq('status', 'active');

      if (admissionsError) throw admissionsError;

      const activePatients = (admissionsData as unknown as AdmissionData[]).map((admission): ActivePatient => ({
        id: admission.id,
        patient_id: admission.patient_id,
        mrn: admission.patients.mrn,
        name: admission.patients.name,
        admission_date: admission.admission_date,
        department: admission.department,
        doctor_name: admission.admitting_doctor?.name || null,
        diagnosis: admission.diagnosis,
        status: admission.status,
        admitting_doctor_id: admission.admitting_doctor_id,
        shift_type: admission.shift_type,
        is_weekend: admission.is_weekend,
        safety_type: admission.safety_type || undefined,
        admitting_doctor: admission.admitting_doctor || null
      }));

      set({ activePatients, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch active patients';
      set({ error: errorMessage, loading: false });
    }
  },

  setSelectedPatient: (patient) => {
    set({ selectedPatient: patient });
  },

  processDischarge: async (data) => {
    set({ loading: true, error: null });
    try {
      const selectedPatient = get().selectedPatient;
      const currentUser = useUserStore.getState().currentUser;

      if (!selectedPatient) throw new Error('No patient selected');
      if (!currentUser) throw new Error('No user logged in');

      // Update admission status
      const { error: updateError } = await supabase
        .from('admissions')
        .update({
          status: 'discharged',
          discharge_date: data.discharge_date,
          discharge_type: data.discharge_type,
          follow_up_required: data.follow_up_required,
          follow_up_date: data.follow_up_date || null,
          discharge_note: data.discharge_note,
          discharge_doctor_id: currentUser.id
        })
        .eq('id', selectedPatient.id)
        .eq('status', 'active');

      if (updateError) throw updateError;

      // Add discharge note
      await useMedicalNotesStore.getState().addNote({
        patient_id: selectedPatient.patient_id,
        doctor_id: currentUser.id,
        note_type: 'Discharge Summary',
        content: data.discharge_note
      });

      // Remove from long stay patients if applicable
      const { calculateStayDuration, LONG_STAY_THRESHOLD } = await import('../utils/stayCalculator');
      const stayDuration = calculateStayDuration(selectedPatient.admission_date);
      if (stayDuration > LONG_STAY_THRESHOLD) {
        useLongStayStore.getState().removeDischargedPatient(selectedPatient.patient_id);
      }

      // Refresh active patients list
      await get().fetchActivePatients();
      set({ selectedPatient: null, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process discharge';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  }
}));