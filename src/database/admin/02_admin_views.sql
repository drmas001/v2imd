-- Create view for active admin users
CREATE OR REPLACE VIEW v_active_admins AS
WITH admin_actions AS (
    SELECT 
        admin_id,
        COUNT(*) as action_count
    FROM 
        admin_audit_logs
    WHERE 
        created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY 
        admin_id
)
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
    COALESCE(aa.action_count, 0) as actions_last_30_days
FROM 
    admin_users au
    JOIN users u ON au.user_id = u.id
    LEFT JOIN admin_actions aa ON au.id = aa.admin_id
WHERE 
    u.status = 'active'
ORDER BY 
    au.role, u.name;

-- Create view for admin activity summary
CREATE OR REPLACE VIEW v_admin_activity_summary AS
WITH action_counts AS (
    SELECT 
        admin_id,
        action_type,
        COUNT(*) as type_count
    FROM 
        admin_audit_logs
    GROUP BY 
        admin_id, action_type
)
SELECT 
    au.id as admin_id,
    u.name as admin_name,
    au.role as admin_role,
    au.department,
    COUNT(al.id) as total_actions,
    MAX(al.created_at) as last_action_date,
    COALESCE(
        jsonb_object_agg(
            COALESCE(ac.action_type, 'no_actions'),
            ac.type_count
        ) FILTER (WHERE ac.action_type IS NOT NULL),
        '{}'::jsonb
    ) as action_counts
FROM 
    admin_users au
    JOIN users u ON au.user_id = u.id
    LEFT JOIN admin_audit_logs al ON au.id = al.admin_id
    LEFT JOIN action_counts ac ON au.id = ac.admin_id
GROUP BY 
    au.id, u.name, au.role, au.department;

-- Create view for department admin stats
CREATE OR REPLACE VIEW v_department_admin_stats AS
WITH dept_actions AS (
    SELECT 
        au.department,
        COUNT(al.id) as action_count,
        COUNT(DISTINCT au.id) as admin_count,
        MAX(al.created_at) as last_action
    FROM 
        admin_users au
        LEFT JOIN admin_audit_logs al ON au.id = al.admin_id
    WHERE 
        au.department IS NOT NULL
    GROUP BY 
        au.department
)
SELECT 
    d.department,
    d.admin_count,
    d.action_count,
    d.last_action,
    array_agg(DISTINCT au.role::text) as admin_roles
FROM 
    dept_actions d
    JOIN admin_users au ON au.department = d.department
GROUP BY 
    d.department, d.admin_count, d.action_count, d.last_action;

-- Grant permissions on views
GRANT SELECT ON v_active_admins TO authenticated;
GRANT SELECT ON v_admin_activity_summary TO authenticated;
GRANT SELECT ON v_department_admin_stats TO authenticated;