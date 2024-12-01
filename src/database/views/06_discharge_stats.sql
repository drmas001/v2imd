-- Discharge Statistics View
CREATE OR REPLACE VIEW discharge_statistics AS
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