-- Trigger to automatically update long stay patients when admissions change
CREATE OR REPLACE FUNCTION update_long_stay_patients()
RETURNS TRIGGER AS $$
BEGIN
    -- If a patient is discharged, remove from long stay tracking
    IF NEW.status = 'discharged' AND OLD.status = 'active' THEN
        PERFORM pg_notify(
            'long_stay_update',
            json_build_object(
                'patient_id', NEW.patient_id,
                'action', 'discharged'
            )::text
        );
    END IF;

    -- If admission duration crosses threshold, add to long stay tracking
    IF NEW.status = 'active' AND 
       EXTRACT(DAY FROM NOW() - NEW.admission_date) > 7 AND
       EXTRACT(DAY FROM NOW() - OLD.admission_date) <= 7 THEN
        PERFORM pg_notify(
            'long_stay_update',
            json_build_object(
                'patient_id', NEW.patient_id,
                'action', 'added'
            )::text
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_long_stay_patients
    AFTER UPDATE ON admissions
    FOR EACH ROW
    EXECUTE FUNCTION update_long_stay_patients();