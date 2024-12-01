-- Department Summary Function
CREATE OR REPLACE FUNCTION get_department_summary(dept_name TEXT)
RETURNS TABLE (
    total_active_patients INTEGER,
    total_consultations INTEGER,
    emergency_patients INTEGER,
    avg_stay_duration NUMERIC,
    pending_discharges INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT a.id)::INTEGER AS total_active_patients,
        COUNT(DISTINCT c.id)::INTEGER AS total_consultations,
        COUNT(DISTINCT CASE WHEN a.safety_type = 'emergency' THEN a.id END)::INTEGER AS emergency_patients,
        ROUND(AVG(EXTRACT(DAY FROM NOW() - a.admission_date)), 1) AS avg_stay_duration,
        COUNT(DISTINCT CASE 
            WHEN a.status = 'active' 
            AND EXTRACT(DAY FROM NOW() - a.admission_date) > 7 
            THEN a.id 
        END)::INTEGER AS pending_discharges
    FROM 
        admissions a
        LEFT JOIN consultations c ON c.consultation_specialty = a.department 
            AND c.status = 'active'
    WHERE 
        a.department = dept_name
        AND a.status = 'active';
END;
$$ LANGUAGE plpgsql;