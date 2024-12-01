-- View for active long stay patients
CREATE OR REPLACE VIEW active_long_stay_patients AS
SELECT 
    p.id AS patient_id,
    p.mrn,
    p.name,
    p.gender,
    p.date_of_birth,
    a.id AS admission_id,
    a.admission_date,
    a.department,
    a.diagnosis,
    a.safety_type,
    a.shift_type,
    a.is_weekend,
    a.visit_number,
    a.admitting_doctor_id,
    u.name AS doctor_name,
    u.medical_code AS doctor_code,
    u.role AS doctor_role,
    u.department AS doctor_department,
    EXTRACT(DAY FROM NOW() - a.admission_date)::INTEGER AS stay_duration,
    COUNT(n.id) AS note_count
FROM 
    patients p
    INNER JOIN admissions a ON p.id = a.patient_id
    LEFT JOIN users u ON a.admitting_doctor_id = u.id
    LEFT JOIN long_stay_notes n ON p.id = n.patient_id
WHERE 
    a.status = 'active'
    AND EXTRACT(DAY FROM NOW() - a.admission_date) > 7
GROUP BY 
    p.id, p.mrn, p.name, p.gender, p.date_of_birth,
    a.id, a.admission_date, a.department, a.diagnosis,
    a.safety_type, a.shift_type, a.is_weekend, a.visit_number,
    a.admitting_doctor_id, u.name, u.medical_code, u.role, u.department
ORDER BY 
    stay_duration DESC;