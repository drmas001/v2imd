-- Drop existing views that depend on the old schema
DROP VIEW IF EXISTS active_admissions CASCADE;
DROP VIEW IF EXISTS discharged_patients CASCADE;
DROP VIEW IF EXISTS admissions_with_doctors CASCADE;

-- Update admissions table structure
ALTER TABLE admissions
  DROP CONSTRAINT IF EXISTS admissions_doctor_id_fkey CASCADE,
  DROP COLUMN IF EXISTS doctor_id CASCADE,
  ADD COLUMN IF NOT EXISTS admitting_doctor_id INTEGER REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS discharge_doctor_id INTEGER REFERENCES users(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admissions_admitting_doctor ON admissions(admitting_doctor_id);
CREATE INDEX IF NOT EXISTS idx_admissions_discharge_doctor ON admissions(discharge_doctor_id);

-- Create view for active admissions with doctor details
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

-- Create view for discharged patients
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

-- Create view for available doctors
CREATE OR REPLACE VIEW available_doctors AS
SELECT 
    id,
    medical_code,
    name,
    role,
    department,
    status
FROM users
WHERE role = 'doctor' 
AND status = 'active'
ORDER BY department, name;

-- Function to get available doctors by department
CREATE OR REPLACE FUNCTION get_available_doctors(department_name TEXT)
RETURNS TABLE (
    id INTEGER,
    medical_code VARCHAR(255),
    name VARCHAR(255),
    role VARCHAR(20),
    department VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.medical_code,
        u.name,
        u.role,
        u.department
    FROM users u
    WHERE u.role = 'doctor'
    AND u.status = 'active'
    AND u.department = department_name
    ORDER BY u.name;
END;
$$ LANGUAGE plpgsql;

-- Function to assign doctor to admission
CREATE OR REPLACE FUNCTION assign_doctor_to_admission(
    admission_id INTEGER,
    doctor_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    doctor_exists BOOLEAN;
BEGIN
    -- Check if doctor exists and is active
    SELECT EXISTS (
        SELECT 1 
        FROM users 
        WHERE id = doctor_id 
        AND role = 'doctor' 
        AND status = 'active'
    ) INTO doctor_exists;

    IF NOT doctor_exists THEN
        RAISE EXCEPTION 'Invalid or inactive doctor ID';
    END IF;

    -- Update admission with new doctor
    UPDATE admissions
    SET admitting_doctor_id = doctor_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = admission_id;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT ON active_admissions TO authenticated;
GRANT SELECT ON discharged_patients TO authenticated;
GRANT SELECT ON available_doctors TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_doctors(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_doctor_to_admission(INTEGER, INTEGER) TO authenticated;