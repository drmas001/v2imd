-- Drop existing types if they exist
DROP TYPE IF EXISTS shift_type CASCADE;
DROP TYPE IF EXISTS safety_type CASCADE;
DROP TYPE IF EXISTS note_type CASCADE;
DROP TYPE IF EXISTS discharge_type CASCADE;
DROP TYPE IF EXISTS urgency_type CASCADE;

-- Create enum types
DO $$ 
BEGIN
    -- Create shift_type enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shift_type') THEN
        CREATE TYPE shift_type AS ENUM (
            'morning',
            'evening',
            'night',
            'weekend_morning',
            'weekend_night'
        );
    END IF;

    -- Create safety_type enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'safety_type') THEN
        CREATE TYPE safety_type AS ENUM (
            'emergency',
            'observation',
            'short-stay'
        );
    END IF;

    -- Create note_type enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'note_type') THEN
        CREATE TYPE note_type AS ENUM (
            'Progress Note',
            'Follow-up Note',
            'Consultation Note',
            'Discharge Note',
            'Discharge Summary'
        );
    END IF;

    -- Create discharge_type enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discharge_type') THEN
        CREATE TYPE discharge_type AS ENUM (
            'regular',
            'against-medical-advice',
            'transfer'
        );
    END IF;

    -- Create urgency_type enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'urgency_type') THEN
        CREATE TYPE urgency_type AS ENUM (
            'routine',
            'urgent',
            'emergency'
        );
    END IF;
END $$;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS medical_notes CASCADE;
DROP TABLE IF EXISTS long_stay_notes CASCADE;
DROP TABLE IF EXISTS consultations CASCADE;
DROP TABLE IF EXISTS admissions CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    medical_code VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('doctor', 'nurse', 'administrator')) NOT NULL,
    department VARCHAR(255) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive')) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create patients table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    mrn VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admissions table
CREATE TABLE admissions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    admitting_doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    discharge_doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    admission_date TIMESTAMP WITH TIME ZONE NOT NULL,
    discharge_date TIMESTAMP WITH TIME ZONE,
    department VARCHAR(255) NOT NULL,
    diagnosis TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'discharged', 'transferred')) NOT NULL,
    safety_type safety_type,
    shift_type shift_type NOT NULL,
    is_weekend BOOLEAN DEFAULT false,
    visit_number INTEGER NOT NULL DEFAULT 1,
    discharge_type discharge_type,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    discharge_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create medical_notes table
CREATE TABLE medical_notes (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES users(id),
    note_type note_type NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create long_stay_notes table
CREATE TABLE long_stay_notes (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create consultations table
CREATE TABLE consultations (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    mrn VARCHAR(255) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    requesting_department VARCHAR(255) NOT NULL,
    patient_location VARCHAR(255) NOT NULL,
    consultation_specialty VARCHAR(255) NOT NULL,
    shift_type shift_type NOT NULL,
    urgency urgency_type NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'completed', 'cancelled')),
    doctor_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by INTEGER REFERENCES users(id),
    completion_note TEXT
);

-- Create appointments table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    medical_number VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    appointment_type VARCHAR(10) CHECK (appointment_type IN ('routine', 'urgent')),
    notes TEXT,
    status VARCHAR(10) CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_admissions_patient_id ON admissions(patient_id);
CREATE INDEX idx_admissions_admitting_doctor ON admissions(admitting_doctor_id);
CREATE INDEX idx_admissions_discharge_doctor ON admissions(discharge_doctor_id);
CREATE INDEX idx_admissions_status ON admissions(status);
CREATE INDEX idx_admissions_safety_type ON admissions(safety_type) WHERE safety_type IS NOT NULL;
CREATE INDEX idx_admissions_shift_type ON admissions(shift_type);
CREATE INDEX idx_admissions_discharge ON admissions(discharge_date) WHERE discharge_date IS NOT NULL;
CREATE INDEX idx_medical_notes_patient ON medical_notes(patient_id);
CREATE INDEX idx_medical_notes_doctor ON medical_notes(doctor_id);
CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_long_stay_notes_patient ON long_stay_notes(patient_id);
CREATE INDEX idx_long_stay_notes_created_by ON long_stay_notes(created_by);
CREATE INDEX idx_appointments_medical_number ON appointments(medical_number);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created_at ON appointments(created_at);
CREATE INDEX idx_users_role_status ON users(role, status) WHERE role = 'doctor' AND status = 'active';
CREATE INDEX idx_users_department ON users(department) WHERE role = 'doctor' AND status = 'active';

-- Create views
CREATE OR REPLACE VIEW active_admissions AS
SELECT 
    a.id,
    a.patient_id,
    p.mrn,
    p.name AS patient_name,
    a.admission_date,
    a.department,
    a.safety_type::text AS safety_type,
    a.shift_type::text AS shift_type,
    a.is_weekend,
    a.diagnosis,
    a.status,
    a.visit_number,
    a.admitting_doctor_id,
    ad.name AS admitting_doctor_name,
    ad.medical_code AS admitting_doctor_code,
    ad.role AS admitting_doctor_role,
    ad.department AS admitting_doctor_department,
    jsonb_build_object(
        'id', ad.id,
        'name', ad.name,
        'medical_code', ad.medical_code,
        'role', ad.role,
        'department', ad.department
    ) AS admitting_doctor
FROM 
    admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users ad ON a.admitting_doctor_id = ad.id
WHERE 
    a.status = 'active';

CREATE OR REPLACE VIEW discharged_patients AS
SELECT 
    a.id,
    a.patient_id,
    p.mrn,
    p.name AS patient_name,
    a.admission_date,
    a.discharge_date,
    a.department,
    a.discharge_type,
    a.follow_up_required,
    a.follow_up_date,
    a.discharge_note,
    a.admitting_doctor_id,
    ad.name AS admitting_doctor_name,
    a.discharge_doctor_id,
    dd.name AS discharge_doctor_name,
    jsonb_build_object(
        'id', ad.id,
        'name', ad.name,
        'medical_code', ad.medical_code,
        'role', ad.role,
        'department', ad.department
    ) AS admitting_doctor,
    jsonb_build_object(
        'id', dd.id,
        'name', dd.name,
        'medical_code', dd.medical_code,
        'role', dd.role,
        'department', dd.department
    ) AS discharge_doctor
FROM 
    admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users ad ON a.admitting_doctor_id = ad.id
    LEFT JOIN users dd ON a.discharge_doctor_id = dd.id
WHERE 
    a.status = 'discharged';

-- Create view for long stay patients
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

-- Create view for consultation statistics
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

-- Create view for doctor workload
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
    ROUND(AVG(EXTRACT(DAY FROM NOW() - a.admission_date)), 1) AS avg_patient_stay,
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

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admissions_updated_at
    BEFORE UPDATE ON admissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_notes_updated_at
    BEFORE UPDATE ON medical_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_long_stay_notes_updated_at
    BEFORE UPDATE ON long_stay_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
    BEFORE UPDATE ON consultations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to get available doctors by department
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

-- Function to get safety alerts
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

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;