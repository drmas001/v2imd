-- Drop dependent views first
DROP VIEW IF EXISTS active_admissions CASCADE;
DROP VIEW IF EXISTS discharged_patients CASCADE;

-- Update admissions table structure
ALTER TABLE admissions
  DROP CONSTRAINT IF EXISTS admissions_doctor_id_fkey CASCADE,
  ADD COLUMN IF NOT EXISTS admitting_doctor_id INTEGER REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS discharge_doctor_id INTEGER REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS discharge_type VARCHAR(50) CHECK (discharge_type IN ('regular', 'against-medical-advice', 'transfer')),
  ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS follow_up_date DATE,
  ADD COLUMN IF NOT EXISTS discharge_note TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admissions_admitting_doctor ON admissions(admitting_doctor_id);
CREATE INDEX IF NOT EXISTS idx_admissions_discharge_doctor ON admissions(discharge_doctor_id);
CREATE INDEX IF NOT EXISTS idx_admissions_discharge_type ON admissions(discharge_type) WHERE discharge_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admissions_follow_up ON admissions(follow_up_date) WHERE follow_up_required = true;

-- Recreate views with correct doctor references
CREATE OR REPLACE VIEW active_admissions AS
SELECT 
    a.id,
    a.patient_id,
    p.mrn,
    p.name AS patient_name,
    a.admission_date,
    a.department,
    a.safety_type::text AS safety_type,
    a.shift_type::text AS shift_type,
    a.is_weekend,
    a.diagnosis,
    a.status,
    a.visit_number,
    a.admitting_doctor_id,
    ad.name AS admitting_doctor_name,
    ad.medical_code AS admitting_doctor_code,
    ad.role AS admitting_doctor_role,
    ad.department AS admitting_doctor_department,
    jsonb_build_object(
        'id', ad.id,
        'name', ad.name,
        'medical_code', ad.medical_code,
        'role', ad.role,
        'department', ad.department
    ) AS admitting_doctor
FROM 
    admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users ad ON a.admitting_doctor_id = ad.id
WHERE 
    a.status = 'active';

-- Recreate discharged_patients view
CREATE OR REPLACE VIEW discharged_patients AS
SELECT 
    a.id,
    a.patient_id,
    p.mrn,
    p.name AS patient_name,
    a.admission_date,
    a.discharge_date,
    a.department,
    a.discharge_type,
    a.follow_up_required,
    a.follow_up_date,
    a.discharge_note,
    a.admitting_doctor_id,
    ad.name AS admitting_doctor_name,
    a.discharge_doctor_id,
    dd.name AS discharge_doctor_name,
    jsonb_build_object(
        'id', ad.id,
        'name', ad.name,
        'medical_code', ad.medical_code,
        'role', ad.role,
        'department', ad.department
    ) AS admitting_doctor,
    jsonb_build_object(
        'id', dd.id,
        'name', dd.name,
        'medical_code', dd.medical_code,
        'role', dd.role,
        'department', dd.department
    ) AS discharge_doctor
FROM 
    admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users ad ON a.admitting_doctor_id = ad.id
    LEFT JOIN users dd ON a.discharge_doctor_id = dd.id
WHERE 
    a.status = 'discharged';

-- Grant necessary permissions
GRANT SELECT ON active_admissions TO authenticated;
GRANT SELECT ON discharged_patients TO authenticated;