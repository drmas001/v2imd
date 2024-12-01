-- Requirements:
-- 1. Get active patients with their current admission details and assigned doctor
-- 2. Get department-wise patient count with safety types
-- 3. Get long-stay patients (admitted > 6 days) with their details
-- 4. Get consultation statistics by department and urgency
-- 5. Get doctor workload statistics
-- 6. Get discharge statistics by department

-- 1. Active Patients Query
-- Returns active patients with their admission details and assigned doctor
CREATE OR REPLACE VIEW active_patient_details AS
SELECT 
    p.id AS patient_id,
    p.mrn,
    p.name AS patient_name,
    p.gender,
    a.id AS admission_id,
    a.admission_date,
    a.department,
    a.diagnosis,
    a.safety_type,
    a.shift_type,
    u.name AS doctor_name,
    u.medical_code AS doctor_code,
    EXTRACT(DAY FROM NOW() - a.admission_date) AS stay_duration
FROM 
    patients p
    INNER JOIN admissions a ON p.id = a.patient_id
    LEFT JOIN users u ON a.admitting_doctor_id = u.id
WHERE 
    a.status = 'active';

-- 2. Department-wise Patient Statistics
-- Returns patient count by department and safety type
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

-- 3. Long Stay Patients Query
-- Returns patients admitted for more than 6 days
CREATE OR REPLACE VIEW long_stay_patients AS
SELECT 
    p.id AS patient_id,
    p.mrn,
    p.name AS patient_name,
    a.admission_date,
    a.department,
    a.diagnosis,
    a.safety_type,
    u.name AS doctor_name,
    EXTRACT(DAY FROM NOW() - a.admission_date) AS stay_duration,
    COUNT(n.id) AS note_count
FROM 
    patients p
    INNER JOIN admissions a ON p.id = a.patient_id
    LEFT JOIN users u ON a.admitting_doctor_id = u.id
    LEFT JOIN long_stay_notes n ON p.id = n.patient_id
WHERE 
    a.status = 'active'
    AND EXTRACT(DAY FROM NOW() - a.admission_date) > 6
GROUP BY 
    p.id, p.mrn, p.name, a.admission_date, a.department, 
    a.diagnosis, a.safety_type, u.name;

-- 4. Consultation Statistics
-- Returns consultation statistics by department and urgency
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

-- 5. Doctor Workload Statistics
-- Returns workload statistics for each doctor
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

-- 6. Discharge Statistics
-- Returns discharge statistics by department
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

-- Function to get department summary
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