-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients(mrn);
CREATE INDEX IF NOT EXISTS idx_admissions_patient_id ON admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_admissions_admitting_doctor ON admissions(admitting_doctor_id);
CREATE INDEX IF NOT EXISTS idx_admissions_discharge_doctor ON admissions(discharge_doctor_id);
CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_safety_type ON admissions(safety_type) WHERE safety_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admissions_shift_type ON admissions(shift_type);
CREATE INDEX IF NOT EXISTS idx_admissions_discharge ON admissions(discharge_date) WHERE discharge_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_long_stay_notes_patient ON long_stay_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_long_stay_notes_created_by ON long_stay_notes(created_by);