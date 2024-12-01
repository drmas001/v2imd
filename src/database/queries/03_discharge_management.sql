-- Discharge Management Queries

-- 1. Get discharge statistics by department
CREATE OR REPLACE VIEW v_discharge_stats AS
WITH discharge_counts AS (
    SELECT 
        department,
        COUNT(*) AS total_discharges,
        COUNT(CASE WHEN discharge_type = 'regular' THEN 1 END) AS regular_discharges,
        COUNT(CASE WHEN discharge_type = 'against-medical-advice' THEN 1 END) AS ama_discharges,
        COUNT(CASE WHEN discharge_type = 'transfer' THEN 1 END) AS transfers,
        ROUND(AVG(EXTRACT(DAY FROM discharge_date - admission_date)), 1) AS avg_los
    FROM 
        admissions
    WHERE 
        status = 'discharged'
        AND discharge_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY 
        department
)
SELECT 
    d.*,
    ROUND(regular_discharges::NUMERIC / NULLIF(total_discharges, 0) * 100, 1) AS regular_discharge_rate,
    ROUND(ama_discharges::NUMERIC / NULLIF(total_discharges, 0) * 100, 1) AS ama_rate,
    ROUND(transfers::NUMERIC / NULLIF(total_discharges, 0) * 100, 1) AS transfer_rate
FROM 
    discharge_counts d;

-- 2. Get patients eligible for discharge (length of stay > 7 days)
CREATE OR REPLACE VIEW v_discharge_eligible AS
SELECT 
    p.id AS patient_id,
    p.mrn,
    p.name AS patient_name,
    a.admission_date,
    a.department,
    a.diagnosis,
    u.name AS doctor_name,
    EXTRACT(DAY FROM NOW() - a.admission_date) AS stay_duration,
    COUNT(n.id) AS note_count
FROM 
    patients p
    INNER JOIN admissions a ON p.id = a.patient_id
    LEFT JOIN users u ON a.admitting_doctor_id = u.id
    LEFT JOIN medical_notes n ON p.id = n.patient_id
WHERE 
    a.status = 'active'
    AND EXTRACT(DAY FROM NOW() - a.admission_date) > 7
GROUP BY 
    p.id, p.mrn, p.name, a.admission_date, a.department, 
    a.diagnosis, u.name;