-- View for active admin users
CREATE OR REPLACE VIEW v_active_admins AS
SELECT 
    au.id as admin_id,
    au.role as admin_role,
    au.permissions,
    au.department,
    au.last_login,
    u.id as user_id,
    u.name,
    u.medical_code,
    u.status,
    (
        SELECT COUNT(*)
        FROM admin_audit_logs al
        WHERE al.admin_id = au.id
        AND al.created_at >= CURRENT_DATE - INTERVAL '30 days'
    ) as actions_last_30_days
FROM 
    admin_users au
    JOIN users u ON au.user_id = u.id
WHERE 
    u.status = 'active'
ORDER BY 
    au.role, u.name;

-- View for admin activity summary
CREATE OR REPLACE VIEW v_admin_activity_summary AS
SELECT 
    au.id as admin_id,
    u.name as admin_name,
    au.role as admin_role,
    au.department,
    COUNT(al.id) as total_actions,
    MAX(al.created_at) as last_action_date,
    jsonb_object_agg(
        al.action_type,
        COUNT(*)
    ) as action_counts
FROM 
    admin_users au
    JOIN users u ON au.user_id = u.id
    LEFT JOIN admin_audit_logs al ON au.id = al.admin_id
GROUP BY 
    au.id, u.name, au.role, au.department;

-- View for department admin summary
CREATE OR REPLACE VIEW v_department_admin_summary AS
SELECT 
    au.department,
    COUNT(DISTINCT au.id) as total_admins,
    array_agg(DISTINCT au.role::text) as admin_roles,
    COUNT(DISTINCT al.id) as total_actions,
    MAX(al.created_at) as last_action_date
FROM 
    admin_users au
    LEFT JOIN admin_audit_logs al ON au.id = al.admin_id
WHERE 
    au.department IS NOT NULL
GROUP BY 
    au.department;