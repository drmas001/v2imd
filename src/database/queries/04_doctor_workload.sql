-- Doctor Workload Management Queries

-- 1. Get doctor workload statistics
CREATE OR REPLACE VIEW v_doctor_workload AS
SELECT 
    u.id AS doctor_id,
    u.name AS doctor_name,
    u.department,
    COUNT(DISTINCT a.id) AS active_patients,
    COUNT(DISTINCT c.id) AS pending_consultations,
    COUNT(DISTINCT CASE 
        WHEN a.safety_type = 'emergency' THEN a.id 
    END) AS emergency_patients,
    ROUND(AVG(EXTRACT(DAY FROM NOW() - a.admission_date)), 1) AS avg_patient_stay,
    -- Calculate overdue consultations
    COUNT(DISTINCT CASE 
        WHEN c.urgency = 'emergency' AND EXTRACT(EPOCH FROM (NOW() - c.created_at))/60 > 30 THEN c.id
        WHEN c.urgency = 'urgent' AND EXTRACT(EPOCH FROM (NOW() - c.created_at))/60 > 120 THEN c.id
        WHEN c.urgency = 'routine' AND EXTRACT(EPOCH FROM (NOW() - c.created_at))/60 > 360 THEN c.id
    END) AS overdue_consultations
FROM 
    users u
    LEFT JOIN admissions a ON u.id = a.admitting_doctor_id AND a.status = 'active'
    LEFT JOIN consultations c ON u.id = c.doctor_id AND c.status = 'active'
WHERE 
    u.role = 'doctor'
    AND u.status = 'active'
GROUP BY 
    u.id, u.name, u.department;

-- 2. Function to get available doctors by department
CREATE OR REPLACE FUNCTION get_available_doctors(
    dept_name TEXT,
    shift_type shift_type DEFAULT NULL
)
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
        WHERE 
            d.role = 'doctor'
            AND d.status = 'active'
            AND d.department = dept_name
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