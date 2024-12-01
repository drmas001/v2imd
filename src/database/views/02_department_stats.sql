-- Department Statistics View
CREATE OR REPLACE VIEW department_statistics AS
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