-- First, ensure the user exists with administrator role
INSERT INTO users (medical_code, name, role, department, status)
VALUES ('DRMAS1191411', 'Dr.mohammed Alshehri Admin', 'administrator', 'Administration', 'active')
ON CONFLICT (medical_code) 
DO UPDATE SET 
    role = 'administrator',
    department = 'Administration',
    status = 'active'
RETURNING id;

-- Then add them as a super admin
WITH admin_user AS (
    SELECT id FROM users WHERE medical_code = 'DRMAS1191411'
)
INSERT INTO admin_users (
    user_id,
    role,
    permissions,
    department
)
SELECT 
    id,
    'super_admin'::admin_role,
    ARRAY[
        'manage_users'::admin_permission,
        'manage_departments'::admin_permission,
        'view_reports'::admin_permission,
        'manage_system'::admin_permission,
        'audit_logs'::admin_permission
    ],
    'Administration'
FROM admin_user
ON CONFLICT (user_id)
DO UPDATE SET
    role = 'super_admin',
    permissions = ARRAY[
        'manage_users'::admin_permission,
        'manage_departments'::admin_permission,
        'view_reports'::admin_permission,
        'manage_system'::admin_permission,
        'audit_logs'::admin_permission
    ];

-- Log the admin creation/update
INSERT INTO admin_audit_logs (
    admin_id,
    action_type,
    action_details
)
SELECT 
    au.id,
    'SUPER_ADMIN_ASSIGNED',
    jsonb_build_object(
        'medical_code', 'DRMAS1191411',
        'name', 'Dr.mohammed Alshehri Admin',
        'role', 'super_admin',
        'timestamp', CURRENT_TIMESTAMP
    )
FROM admin_users au
JOIN users u ON au.user_id = u.id
WHERE u.medical_code = 'DRMAS1191411';