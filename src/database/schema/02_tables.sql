-- Create base tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    medical_code VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('doctor', 'nurse', 'administrator')) NOT NULL,
    department VARCHAR(255) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive')) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    mrn VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admissions (
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

CREATE TABLE IF NOT EXISTS consultations (
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

CREATE TABLE IF NOT EXISTS long_stay_notes (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);