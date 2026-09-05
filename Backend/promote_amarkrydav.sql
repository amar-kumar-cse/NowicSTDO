-- ====================================================================
-- SQL Script to Promote amarkrydav@gmail.com to Admin in Nowic Studio
-- Run this in Supabase SQL Editor or your PostgreSQL database
-- ====================================================================

-- 1. If you already have your Clerk User ID (from Clerk Dashboard > Users > user_...):
-- Replace 'PASTE_YOUR_CLERK_USER_ID_HERE' with your actual user_... ID:
DO $$
DECLARE
    v_clerk_id text := 'PASTE_YOUR_CLERK_USER_ID_HERE'; -- e.g. 'user_2xyz...'
    v_email text := 'amarkrydav@gmail.com';
    v_name text := 'Amar Yadav';
BEGIN
    IF v_clerk_id <> 'PASTE_YOUR_CLERK_USER_ID_HERE' THEN
        INSERT INTO users_userprofile (clerk_user_id, email, full_name, role, is_active, created_at)
        VALUES (v_clerk_id, v_email, v_name, 'admin', true, NOW())
        ON CONFLICT (email) DO UPDATE
        SET clerk_user_id = EXCLUDED.clerk_user_id,
            role = 'admin',
            is_active = true;
        RAISE NOTICE 'Successfully linked % with Clerk ID % as admin.', v_email, v_clerk_id;
    ELSE
        -- If you do not have your Clerk ID yet, ensure existing profile is set to admin:
        UPDATE users_userprofile
        SET role = 'admin',
            is_active = true
        WHERE LOWER(email) = v_email;

        IF NOT FOUND THEN
            INSERT INTO users_userprofile (clerk_user_id, email, full_name, role, is_active, created_at)
            VALUES ('pending_admin_' || v_email, v_email, v_name, 'admin', true, NOW())
            ON CONFLICT (email) DO UPDATE
            SET role = 'admin',
                is_active = true;
            RAISE NOTICE 'Created pending admin profile for %. Next time you log in, the updated backend will auto-link your Clerk ID.', v_email;
        ELSE
            RAISE NOTICE 'Updated existing profile for % to admin.', v_email;
        END IF;
    END IF;
END $$;

-- Verify the result:
SELECT clerk_user_id, email, full_name, role, is_active, created_at 
FROM users_userprofile 
WHERE LOWER(email) = 'amarkrydav@gmail.com';
