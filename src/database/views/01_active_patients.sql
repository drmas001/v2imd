-- Active Patients View
CREATE OR REPLACE VIEW active_patient_details AS
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
    u.name AS doctor_name,
    u.medical_code AS doctor_code,
    EXTRACT(DAY FROM NOW() - a.admission_date) AS stay_duration
FROM 
    patients p
    INNER JOIN admissions a ON p.id = a.patient_id
    LEFT JOIN users u ON a.admitting_doctor_id = u.id
WHERE 
    a.status = 'active';