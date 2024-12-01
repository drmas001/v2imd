-- Consultation Management Queries

-- 1. Get active consultations with response times
CREATE OR REPLACE VIEW v_active_consultations AS
SELECT 
    c.*,
    u.name AS doctor_name,
    CASE 
        WHEN c.completed_at IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (c.completed_at - c.created_at))/60 
    END AS response_time_minutes,
    CASE
        WHEN c.urgency = 'emergency' AND EXTRACT(EPOCH FROM (NOW() - c.created_at))/60 > 30 THEN true
        WHEN c.urgency = 'urgent' AND EXTRACT(EPOCH FROM (NOW() - c.created_at))/60 > 120 THEN true
        WHEN c.urgency = 'routine' AND EXTRACT(EPOCH FROM (NOW() - c.created_at))/60 > 360 THEN true
        ELSE false
    END AS is_overdue
FROM 
    consultations c
    LEFT JOIN users u ON c.doctor_id = u.id
WHERE 
    c.status = 'active';

-- 2. Get consultation statistics by department and urgency
CREATE OR REPLACE VIEW v_consultation_stats AS
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