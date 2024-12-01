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
    doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
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
CREATE INDEX idx_admissions_doctor ON admissions(doctor_id);
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
    a.doctor_id,
    u.name AS doctor_name,
    u.medical_code AS doctor_code,
    u.role AS doctor_role,
    u.department AS doctor_department
FROM 
    admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users u ON a.doctor_id = u.id
WHERE 
    a.status = 'active'
    AND (u.role = 'doctor' OR u.role IS NULL)
    AND (u.status = 'active' OR u.status IS NULL);

CREATE OR REPLACE VIEW discharged_patients AS
SELECT 
    a.id,
    a.patient_id,
    p.mrn,
    p.name AS patient_name,
    a.admission_date,
    a.discharge_date,
    a.department,
    a.discharge_type::text AS discharge_type,
    a.follow_up_required,
    a.follow_up_date,
    a.discharge_note,
    a.doctor_id,
    u.name AS doctor_name,
    u.medical_code AS doctor_code,
    u.role AS doctor_role,
    u.department AS doctor_department
FROM 
    admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users u ON a.doctor_id = u.id
WHERE 
    a.status = 'discharged'
    AND (u.role = 'doctor' OR u.role IS NULL)
    AND (u.status = 'active' OR u.status IS NULL);

CREATE OR REPLACE VIEW available_doctors AS
SELECT 
    id,
    medical_code,
    name,
    role,
    department,
    status
FROM users
WHERE role = 'doctor' 
AND status = 'active'
ORDER BY department, name;

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
CREATE OR REPLACE FUNCTION get_available_doctors(department_name TEXT)
RETURNS TABLE (
    id INTEGER,
    medical_code VARCHAR(255),
    name VARCHAR(255),
    role VARCHAR(20),
    department VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.medical_code,
        u.name,
        u.role,
        u.department
    FROM users u
    WHERE u.role = 'doctor'
    AND u.status = 'active'
    AND u.department = department_name
    ORDER BY u.name;
END;
$$ LANGUAGE plpgsql;

-- Function to assign doctor to admission
CREATE OR REPLACE FUNCTION assign_doctor_to_admission(
    admission_id INTEGER,
    doctor_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    doctor_exists BOOLEAN;
BEGIN
    -- Check if doctor exists and is active
    SELECT EXISTS (
        SELECT 1 
        FROM users 
        WHERE id = doctor_id 
        AND role = 'doctor' 
        AND status = 'active'
    ) INTO doctor_exists;

    IF NOT doctor_exists THEN
        RAISE EXCEPTION 'Invalid or inactive doctor ID';
    END IF;

    -- Update admission with new doctor
    UPDATE admissions
    SET doctor_id = doctor_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = admission_id;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;