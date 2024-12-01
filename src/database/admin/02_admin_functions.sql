-- Function to add admin user
CREATE OR REPLACE FUNCTION add_admin_user(
    p_user_id INTEGER,
    p_role admin_role,
    p_permissions admin_permission[],
    p_department VARCHAR(255) DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_admin_id INTEGER;
BEGIN
    -- Verify user exists and is active
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = p_user_id 
        AND status = 'active'
        AND role = 'administrator'
    ) THEN
        RAISE EXCEPTION 'Invalid or inactive user, or user is not an administrator';
    END IF;

    -- Insert new admin user
    INSERT INTO admin_users (
        user_id,
        role,
        permissions,
        department
    ) VALUES (
        p_user_id,
        p_role,
        p_permissions,
        p_department
    ) RETURNING id INTO v_admin_id;

    RETURN v_admin_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update admin permissions
CREATE OR REPLACE FUNCTION update_admin_permissions(
    p_admin_id INTEGER,
    p_permissions admin_permission[]
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE admin_users
    SET 
        permissions = p_permissions,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_admin_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_id INTEGER,
    p_action_type VARCHAR(50),
    p_action_details JSONB,
    p_ip_address VARCHAR(45) DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_log_id INTEGER;
BEGIN
    INSERT INTO admin_audit_logs (
        admin_id,
        action_type,
        action_details,
        ip_address,
        user_agent
    ) VALUES (
        p_admin_id,
        p_action_type,
        p_action_details,
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get admin activity report
CREATE OR REPLACE FUNCTION get_admin_activity_report(
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE,
    p_admin_id INTEGER DEFAULT NULL
) RETURNS TABLE (
    admin_name VARCHAR(255),
    admin_role admin_role,
    action_type VARCHAR(50),
    action_details JSONB,
    action_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.name as admin_name,
        au.role as admin_role,
        al.action_type,
        al.action_details,
        al.created_at as action_date
    FROM 
        admin_audit_logs al
        JOIN admin_users au ON al.admin_id = au.id
        JOIN users u ON au.user_id = u.id
    WHERE 
        al.created_at BETWEEN p_start_date AND p_end_date
        AND (p_admin_id IS NULL OR al.admin_id = p_admin_id)
    ORDER BY 
        al.created_at DESC;
END;
$$ LANGUAGE plpgsql;