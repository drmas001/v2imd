-- Insert sample users
INSERT INTO users (medical_code, name, role, department) VALUES
('DR001', 'Dr. John Smith', 'doctor', 'Internal Medicine'),
('DR002', 'Dr. Sarah Johnson', 'doctor', 'Pulmonology'),
('DR003', 'Dr. Michael Brown', 'doctor', 'Neurology'),
('NR001', 'Nurse Emma Davis', 'nurse', 'Internal Medicine'),
('NR002', 'Nurse James Wilson', 'nurse', 'Pulmonology'),
('ADM001', 'Admin User', 'administrator', 'Administration');

-- Insert sample patients
INSERT INTO patients (mrn, name, date_of_birth, gender) VALUES
('MRN001', 'Alice Thompson', '1980-05-15', 'female'),
('MRN002', 'Bob Anderson', '1975-08-22', 'male'),
('MRN003', 'Carol Martinez', '1990-03-10', 'female');

-- Insert sample admissions
INSERT INTO admissions (
    patient_id, 
    doctor_id,
    admission_date,
    department,
    diagnosis,
    status,
    safety_type,
    shift_type,
    is_weekend,
    visit_number
) VALUES
(1, 1, CURRENT_TIMESTAMP - INTERVAL '5 days', 'Internal Medicine', 'Pneumonia', 'active', 'observation', 'morning', false, 1),
(2, 2, CURRENT_TIMESTAMP - INTERVAL '3 days', 'Pulmonology', 'COPD Exacerbation', 'active', 'emergency', 'morning', false, 1),
(3, 3, CURRENT_TIMESTAMP - INTERVAL '7 days', 'Neurology', 'Migraine', 'active', 'short-stay', 'morning', false, 1);

-- Insert sample medical notes
INSERT INTO medical_notes (patient_id, doctor_id, note_type, content) VALUES
(1, 1, 'Progress Note', 'Patient showing improvement with antibiotics'),
(2, 2, 'Progress Note', 'Breathing improved after bronchodilator therapy'),
(3, 3, 'Progress Note', 'Headache intensity decreased with medication');

-- Insert sample long stay notes
INSERT INTO long_stay_notes (patient_id, content, created_by) VALUES
(1, 'Patient requires extended monitoring due to complex pneumonia', 1),
(2, 'Extended stay needed for pulmonary rehabilitation', 2);

-- Insert sample consultations
INSERT INTO consultations (
    patient_id,
    mrn,
    patient_name,
    age,
    gender,
    requesting_department,
    patient_location,
    consultation_specialty,
    shift_type,
    urgency,
    reason,
    status,
    doctor_id
) VALUES
(1, 'MRN001', 'Alice Thompson', 43, 'female', 'Emergency', 'ER-101', 'Internal Medicine', 'morning', 'urgent', 'Respiratory distress', 'active', 1),
(2, 'MRN002', 'Bob Anderson', 48, 'male', 'Internal Medicine', 'Ward-2A', 'Pulmonology', 'morning', 'routine', 'COPD evaluation', 'active', 2);

-- Insert sample appointments
INSERT INTO appointments (
    patient_name,
    medical_number,
    specialty,
    appointment_type,
    notes,
    status
) VALUES
('David Wilson', 'MRN004', 'Internal Medicine', 'routine', 'Follow-up appointment', 'pending'),
('Eva Brown', 'MRN005', 'Pulmonology', 'urgent', 'Breathing difficulties', 'pending');