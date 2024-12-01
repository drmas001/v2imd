-- Safety Monitoring Queries

-- 1. Get safety admission statistics
CREATE OR REPLACE VIEW v_safety_stats AS
SELECT 
    safety_type,
    COUNT(*) AS total_admissions,
    COUNT(DISTINCT department) AS departments_count,
    ROUND(AVG(EXTRACT(DAY FROM NOW() - admission_date)), 1) AS avg_stay_duration,
    COUNT(CASE WHEN EXTRACT(DAY FROM NOW() - admission_date) > 7 THEN 1 END) AS extended_stays
FROM 
    admissions
WHERE 
    status = 'active'
    AND safety_type IS NOT NULL
GROUP BY 
    safety_type;

-- 2. Function to get safety alerts
CREATE OR REPLACE FUNCTION get_safety_alerts()
RETURNS TABLE (
    alert_type TEXT,
    patient_id INTEGER,
    mrn VARCHAR(255),
    patient_name VARCHAR(255),
    department VARCHAR(255),
    safety_type safety_type,
    alert_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Long stay patients without recent notes
    SELECT 
        'No Recent Notes'::TEXT as alert_type,
        p.id as patient_id,
        p.mrn,
        p.name as patient_name,
        a.department,
        a.safety_type,
        'No medical notes in last 24 hours'::TEXT as alert_reason
    FROM 
        admissions a
        JOIN patients p ON a.patient_id = p.id
        LEFT JOIN medical_notes n ON p.id = n.patient_id 
            AND n.created_at > NOW() - INTERVAL '24 hours'
    WHERE 
        a.status = 'active'
        AND a.safety_type IS NOT NULL
        AND n.id IS NULL

    UNION ALL

    -- Patients with emergency safety type but no doctor assigned
    SELECT 
        'No Doctor Assigned'::TEXT,
        p.id,
        p.mrn,
        p.name,
        a.department,
        a.safety_type,
        'Emergency patient without assigned doctor'::TEXT
    FROM 
        admissions a
        JOIN patients p ON a.patient_id = p.id
    WHERE 
        a.status = 'active'
        AND a.safety_type = 'emergency'
        AND a.admitting_doctor_id IS NULL;
END;
$$ LANGUAGE plpgsql;