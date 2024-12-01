-- Consultation Statistics View
CREATE OR REPLACE VIEW consultation_statistics AS
SELECT 
    consultation_specialty,
    COUNT(*) AS total_consultations,
    COUNT(CASE WHEN urgency = 'emergency' THEN 1 END) AS emergency_count,
    COUNT(CASE WHEN urgency = 'urgent' THEN 1 END) AS urgent_count,
    COUNT(CASE WHEN urgency = 'routine' THEN 1 END) AS routine_count,
    ROUND(AVG(CASE 
        WHEN completed_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (completed_at - created_at))/60 
    END), 0) AS avg_response_time_minutes
FROM 
    consultations
WHERE 
    created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY 
    consultation_specialty;