-- Function to get long stay patients
CREATE OR REPLACE FUNCTION get_long_stay_patients(threshold_days INTEGER DEFAULT 7)
RETURNS TABLE (
    patient_id INTEGER,
    mrn VARCHAR(255),
    name VARCHAR(255),
    admission_date TIMESTAMP WITH TIME ZONE,
    department VARCHAR(255),
    diagnosis TEXT,
    safety_type safety_type,
    doctor_name VARCHAR(255),
    stay_duration INTEGER,
    admitting_doctor_id INTEGER,
    status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS patient_id,
        p.mrn,
        p.name,
        a.admission_date,
        a.department,
        a.diagnosis,
        a.safety_type,
        u.name AS doctor_name,
        EXTRACT(DAY FROM NOW() - a.admission_date)::INTEGER AS stay_duration,
        a.admitting_doctor_id,
        a.status
    FROM 
        patients p
        INNER JOIN admissions a ON p.id = a.patient_id
        LEFT JOIN users u ON a.admitting_doctor_id = u.id
    WHERE 
        a.status = 'active'
        AND EXTRACT(DAY FROM NOW() - a.admission_date) > threshold_days
    ORDER BY 
        stay_duration DESC;
END;
$$ LANGUAGE plpgsql;