-- Trigger function to update last_login
CREATE OR REPLACE FUNCTION update_admin_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE admin_users
    SET last_login = CURRENT_TIMESTAMP
    WHERE user_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to log admin changes
CREATE OR REPLACE FUNCTION log_admin_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_admin_action(
            NEW.id,
            'ADMIN_CREATED',
            jsonb_build_object(
                'role', NEW.role,
                'permissions', NEW.permissions,
                'department', NEW.department
            )
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.role != OLD.role OR 
           NEW.permissions != OLD.permissions OR 
           NEW.department != OLD.department THEN
            PERFORM log_admin_action(
                NEW.id,
                'ADMIN_UPDATED',
                jsonb_build_object(
                    'old_role', OLD.role,
                    'new_role', NEW.role,
                    'old_permissions', OLD.permissions,
                    'new_permissions', NEW.permissions,
                    'old_department', OLD.department,
                    'new_department', NEW.department
                )
            );
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_admin_action(
            OLD.id,
            'ADMIN_DELETED',
            jsonb_build_object(
                'role', OLD.role,
                'department', OLD.department
            )
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trg_admin_last_login
    AFTER UPDATE OF last_login ON users
    FOR EACH ROW
    WHEN (NEW.role = 'administrator')
    EXECUTE FUNCTION update_admin_last_login();

CREATE TRIGGER trg_log_admin_changes
    AFTER INSERT OR UPDATE OR DELETE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION log_admin_changes();