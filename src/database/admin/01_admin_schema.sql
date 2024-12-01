-- Create admin-specific types if they don't exist
DO $$ 
DECLARE
BEGIN
    -- Create admin_role type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        CREATE TYPE admin_role AS ENUM (
            'super_admin',
            'department_admin',
            'system_admin'
        );
    END IF;

    -- Create admin_permission type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_permission') THEN
        CREATE TYPE admin_permission AS ENUM (
            'manage_users',
            'manage_departments',
            'view_reports',
            'manage_system',
            'audit_logs'
        );
    END IF;
END $$;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role admin_role NOT NULL DEFAULT 'department_admin',
    permissions admin_permission[] NOT NULL DEFAULT '{}',
    department VARCHAR(255),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_admin_user UNIQUE (user_id)
);

-- Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admin_users(id),
    action_type VARCHAR(50) NOT NULL,
    action_details JSONB NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_department ON admin_users(department) WHERE department IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON admin_audit_logs(created_at);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_admin_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for admin_users
CREATE TRIGGER update_admin_users_timestamp
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_timestamp();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON admin_users TO authenticated;
GRANT SELECT, INSERT ON admin_audit_logs TO authenticated;
GRANT USAGE ON SEQUENCE admin_users_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE admin_audit_logs_id_seq TO authenticated;