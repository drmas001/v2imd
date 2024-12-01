-- Long Stay Patients View
CREATE OR REPLACE VIEW long_stay_patients AS
SELECT 
    p.id AS patient_id,
    p.mrn,
    p.name AS patient_name,
    a.admission_date,
    a.department,
    a.diagnosis,
    a.safety_type,
    u.name AS doctor_name,
    EXTRACT(DAY FROM NOW() - a.admission_date) AS stay_duration,
    COUNT(n.id) AS note_count
FROM 
    patients p
    INNER JOIN admissions a ON p.id = a.patient_id
    LEFT JOIN users u ON a.admitting_doctor_id = u.id
    LEFT JOIN long_stay_notes n ON p.id = n.patient_id
WHERE 
    a.status = 'active'
    AND EXTRACT(DAY FROM NOW() - a.admission_date) > 6
GROUP BY 
    p.id, p.mrn, p.name, a.admission_date, a.department, 
    a.diagnosis, a.safety_type, u.name;