-- Create admin-specific roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_super') THEN
        CREATE ROLE admin_super;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_department') THEN
        CREATE ROLE admin_department;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_system') THEN
        CREATE ROLE admin_system;
    END IF;
END
$$;

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE ON admin_users TO admin_super;
GRANT SELECT, INSERT ON admin_audit_logs TO admin_super;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO admin_super;

GRANT SELECT ON admin_users TO admin_department;
GRANT SELECT ON admin_audit_logs TO admin_department;
GRANT SELECT, UPDATE ON users TO admin_department;

GRANT SELECT ON admin_users TO admin_system;
GRANT SELECT ON admin_audit_logs TO admin_system;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO admin_system;

-- Create row level security policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Super admin can see everything
CREATE POLICY super_admin_all ON admin_users
    FOR ALL
    TO admin_super
    USING (true);

-- Department admins can only see their department
CREATE POLICY department_admin_view ON admin_users
    FOR SELECT
    TO admin_department
    USING (department = current_setting('app.current_department'));

-- System admins can view but not modify
CREATE POLICY system_admin_view ON admin_users
    FOR SELECT
    TO admin_system
    USING (true);

-- Audit log policies
CREATE POLICY audit_super_admin ON admin_audit_logs
    FOR ALL
    TO admin_super
    USING (true);

CREATE POLICY audit_department_view ON admin_audit_logs
    FOR SELECT
    TO admin_department
    USING (
        admin_id IN (
            SELECT id FROM admin_users 
            WHERE department = current_setting('app.current_department')
        )
    );

CREATE POLICY audit_system_view ON admin_audit_logs
    FOR SELECT
    TO admin_system
    USING (true);