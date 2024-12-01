-- Drop dependent views first
DROP VIEW IF EXISTS active_admissions CASCADE;
DROP VIEW IF EXISTS discharged_patients CASCADE;
DROP VIEW IF EXISTS doctor_workload CASCADE;
DROP VIEW IF EXISTS doctor_workload_stats CASCADE;

-- Drop existing indexes and constraints
DROP INDEX IF EXISTS idx_users_role_status;
DROP INDEX IF EXISTS idx_users_department;

-- Create specialties table
CREATE TABLE IF NOT EXISTS specialties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add specialty_id to users table and migrate data
ALTER TABLE users ADD COLUMN specialty_id INTEGER;

-- Migrate existing department data to specialties
INSERT INTO specialties (name)
SELECT DISTINCT department FROM users WHERE department IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- Update users with specialty_id based on department
UPDATE users u
SET specialty_id = s.id
FROM specialties s
WHERE u.department = s.name;

-- Add foreign key constraint after data migration
ALTER TABLE users 
    ADD CONSTRAINT users_specialty_id_fkey 
    FOREIGN KEY (specialty_id) 
    REFERENCES specialties(id);

-- Now it's safe to drop the department column
ALTER TABLE users DROP COLUMN department;

-- Create indexes for better performance
CREATE INDEX idx_users_role_specialty ON users(role, specialty_id) 
    WHERE role = 'doctor' AND status = 'active';
CREATE INDEX idx_users_specialty_status ON users(specialty_id, status) 
    WHERE role = 'doctor';

-- Insert default specialties if not already present
INSERT INTO specialties (name, description) VALUES
    ('Internal Medicine', 'General internal medicine department'),
    ('Pulmonology', 'Respiratory system specialists'),
    ('Neurology', 'Nervous system specialists'),
    ('Gastroenterology', 'Digestive system specialists'),
    ('Rheumatology', 'Musculoskeletal disease specialists'),
    ('Endocrinology', 'Hormone specialists'),
    ('Hematology', 'Blood disorders specialists'),
    ('Infectious Disease', 'Infection specialists'),
    ('Thrombosis Medicine', 'Blood clotting specialists'),
    ('Immunology & Allergy', 'Immune system specialists')
ON CONFLICT (name) DO NOTHING;

-- Recreate views with updated schema
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
    s.name AS doctor_specialty,
    jsonb_build_object(
        'id', ad.id,
        'name', ad.name,
        'medical_code', ad.medical_code,
        'role', ad.role,
        'specialty', s.name
    ) AS admitting_doctor
FROM 
    admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users ad ON a.admitting_doctor_id = ad.id
    LEFT JOIN specialties s ON ad.specialty_id = s.id
WHERE 
    a.status = 'active';

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
        'specialty', s1.name
    ) AS admitting_doctor,
    jsonb_build_object(
        'id', dd.id,
        'name', dd.name,
        'medical_code', dd.medical_code,
        'role', dd.role,
        'specialty', s2.name
    ) AS discharge_doctor
FROM 
    admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users ad ON a.admitting_doctor_id = ad.id
    LEFT JOIN users dd ON a.discharge_doctor_id = dd.id
    LEFT JOIN specialties s1 ON ad.specialty_id = s1.id
    LEFT JOIN specialties s2 ON dd.specialty_id = s2.id
WHERE 
    a.status = 'discharged';

-- Function to get available doctors by specialty
CREATE OR REPLACE FUNCTION get_available_doctors(specialty_name TEXT)
RETURNS TABLE (
    id INTEGER,
    medical_code VARCHAR(255),
    name VARCHAR(255),
    active_patients INTEGER,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH doctor_load AS (
        SELECT 
            d.id,
            d.medical_code,
            d.name,
            COUNT(a.id) AS active_patients
        FROM 
            users d
            LEFT JOIN admissions a ON d.id = a.admitting_doctor_id 
                AND a.status = 'active'
            JOIN specialties s ON d.specialty_id = s.id
        WHERE 
            d.role = 'doctor'
            AND d.status = 'active'
            AND s.name = specialty_name
        GROUP BY 
            d.id, d.medical_code, d.name
    )
    SELECT 
        dl.id,
        dl.medical_code,
        dl.name,
        dl.active_patients,
        CASE 
            WHEN dl.active_patients >= 10 THEN false  -- Max patient load
            ELSE true
        END AS is_available
    FROM 
        doctor_load dl
    ORDER BY 
        dl.active_patients ASC, dl.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to assign doctor to admission
CREATE OR REPLACE FUNCTION assign_doctor_to_admission(
    admission_id INTEGER,
    doctor_id INTEGER,
    is_discharge BOOLEAN DEFAULT false
) RETURNS BOOLEAN AS $$
DECLARE
    doctor_exists BOOLEAN;
    doctor_specialty INTEGER;
    admission_specialty TEXT;
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

    -- Get doctor's specialty and admission department
    SELECT specialty_id INTO doctor_specialty
    FROM users
    WHERE id = doctor_id;

    SELECT s.id INTO admission_specialty
    FROM admissions a
    JOIN specialties s ON a.department = s.name
    WHERE a.id = admission_id;

    -- Verify specialty match
    IF doctor_specialty != admission_specialty THEN
        RAISE EXCEPTION 'Doctor specialty does not match admission department';
    END IF;

    -- Update admission with new doctor
    IF is_discharge THEN
        UPDATE admissions
        SET discharge_doctor_id = doctor_id,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = admission_id;
    ELSE
        UPDATE admissions
        SET admitting_doctor_id = doctor_id,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = admission_id;
    END IF;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- View for doctor workload statistics
CREATE OR REPLACE VIEW doctor_workload_stats AS
SELECT 
    u.id AS doctor_id,
    u.name AS doctor_name,
    u.medical_code,
    s.name AS specialty,
    COUNT(DISTINCT a.id) AS active_patients,
    COUNT(DISTINCT c.id) AS pending_consultations,
    COUNT(DISTINCT CASE 
        WHEN a.safety_type = 'emergency' THEN a.id 
    END) AS emergency_patients,
    ROUND(AVG(EXTRACT(DAY FROM NOW() - a.admission_date)), 1) AS avg_patient_stay
FROM 
    users u
    JOIN specialties s ON u.specialty_id = s.id
    LEFT JOIN admissions a ON u.id = a.admitting_doctor_id AND a.status = 'active'
    LEFT JOIN consultations c ON u.id = c.doctor_id AND c.status = 'active'
WHERE 
    u.role = 'doctor'
    AND u.status = 'active'
GROUP BY 
    u.id, u.name, u.medical_code, s.name;

-- Grant necessary permissions
GRANT SELECT ON specialties TO authenticated;
GRANT SELECT ON doctor_workload_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_doctors(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_doctor_to_admission(INTEGER, INTEGER, BOOLEAN) TO authenticated;