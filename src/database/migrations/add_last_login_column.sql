-- First check if the column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'last_login'
    ) THEN
        -- Add the last_login column if it doesn't exist
        ALTER TABLE users
        ADD COLUMN last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

        -- Create index for better query performance
        CREATE INDEX idx_users_last_login ON users(last_login);

        -- Update the trigger function to handle last_login updates
        CREATE OR REPLACE FUNCTION update_user_last_login()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.last_login = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create trigger for updating last_login
        CREATE TRIGGER trg_update_user_last_login
            BEFORE UPDATE OF last_login ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_user_last_login();
    END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT, UPDATE(last_login) ON users TO authenticated;