-- Create enum types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shift_type') THEN
        CREATE TYPE shift_type AS ENUM (
            'morning',
            'evening',
            'night',
            'weekend_morning',
            'weekend_night'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'safety_type') THEN
        CREATE TYPE safety_type AS ENUM (
            'emergency',
            'observation',
            'short-stay'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'note_type') THEN
        CREATE TYPE note_type AS ENUM (
            'Progress Note',
            'Follow-up Note',
            'Consultation Note',
            'Discharge Note',
            'Discharge Summary'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discharge_type') THEN
        CREATE TYPE discharge_type AS ENUM (
            'regular',
            'against-medical-advice',
            'transfer'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'urgency_type') THEN
        CREATE TYPE urgency_type AS ENUM (
            'routine',
            'urgent',
            'emergency'
        );
    END IF;
END $$;