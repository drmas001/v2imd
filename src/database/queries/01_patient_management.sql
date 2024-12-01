-- Patient Management Queries

-- 1. Get active patients with their current admission details and assigned doctor
CREATE OR REPLACE VIEW v_active_patients AS
SELECT 
    p.id AS patient_id,
    p.mrn,
    p.name AS patient_name,
    p.gender,
    a.id AS admission_id,
    a.admission_date,
    a.department,
    a.diagnosis,
    a.safety_type,
    a.shift_type,
    a.is_weekend,
    u.id AS doctor_id,
    u.name AS doctor_name,
    u.medical_code AS doctor_code,
    EXTRACT(DAY FROM NOW() - a.admission_date) AS stay_duration
FROM 
    patients p
    INNER JOIN admissions a ON p.id = a.patient_id
    LEFT JOIN users u ON a.admitting_doctor_id = u.id
WHERE 
    a.status = 'active';

-- 2. Get department-wise patient statistics with safety types
CREATE OR REPLACE VIEW v_department_stats AS
SELECT 
    department,
    COUNT(*) AS total_patients,
    COUNT(CASE WHEN safety_type = 'emergency' THEN 1 END) AS emergency_count,
    COUNT(CASE WHEN safety_type = 'observation' THEN 1 END) AS observation_count,
    COUNT(CASE WHEN safety_type = 'short-stay' THEN 1 END) AS short_stay_count,
    ROUND(AVG(EXTRACT(DAY FROM NOW() - admission_date)), 1) AS avg_stay_duration
FROM 
    admissions
WHERE 
    status = 'active'
GROUP BY 
    department;