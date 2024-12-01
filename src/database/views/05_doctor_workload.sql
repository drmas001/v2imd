-- Doctor Workload View
CREATE OR REPLACE VIEW doctor_workload AS
SELECT 
    u.id AS doctor_id,
    u.name AS doctor_name,
    u.department,
    COUNT(DISTINCT a.id) AS active_patients,
    COUNT(DISTINCT c.id) AS pending_consultations,
    COUNT(DISTINCT CASE 
        WHEN a.safety_type = 'emergency' THEN a.id 
    END) AS emergency_patients,
    ROUND(AVG(EXTRACT(DAY FROM NOW() - a.admission_date)), 1) AS avg_patient_stay
FROM 
    users u
    LEFT JOIN admissions a ON u.id = a.admitting_doctor_id AND a.status = 'active'
    LEFT JOIN consultations c ON u.id = c.doctor_id AND c.status = 'active'
WHERE 
    u.role = 'doctor'
    AND u.status = 'active'
GROUP BY 
    u.id, u.name, u.department;