-- Migration: Link OAuth accounts to existing email/password accounts
-- This ensures that when someone signs in with Google OAuth, they are linked to their existing account

-- Step 1: Add a column to track the Supabase Auth user ID (optional, for reference)
-- This helps us link auth.users to public.users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS supabase_auth_user_id UUID;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_supabase_auth_user_id ON public.users(supabase_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON public.users(LOWER(email));

-- Step 2: Create a function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.link_oauth_to_existing_user()
RETURNS TRIGGER AS $$
DECLARE
  existing_user_id INTEGER;
  normalized_email TEXT;
  oauth_provider TEXT;
  user_name TEXT;
BEGIN
  -- Only process if email is present
  IF NEW.email IS NULL THEN
    RETURN NEW;
  END IF;

  -- Normalize email to lowercase
  normalized_email := LOWER(TRIM(NEW.email));
  
  -- Determine OAuth provider from identities
  -- Only process if this is an OAuth signup (not email/password)
  IF NEW.identities IS NOT NULL AND jsonb_array_length(NEW.identities) > 0 THEN
    oauth_provider := NEW.identities->0->>'provider';
    -- Skip if this is an email/password signup (not OAuth)
    IF oauth_provider = 'email' THEN
      RETURN NEW;
    END IF;
  ELSE
    -- No identities means this might be a direct insert, skip it
    RETURN NEW;
  END IF;

  -- Get user name from metadata
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(normalized_email, '@', 1)
  );

  -- Check if a user with this email already exists in public.users
  SELECT id INTO existing_user_id
  FROM public.users
  WHERE LOWER(TRIM(email)) = normalized_email
    AND deleted_at IS NULL
  LIMIT 1;

  IF existing_user_id IS NOT NULL THEN
    -- User exists: link the OAuth account to the existing user
    -- Only update supabase_auth_user_id if it's not already set (preserve first link)
    UPDATE public.users
    SET 
      supabase_auth_user_id = COALESCE(supabase_auth_user_id, NEW.id),
      updated_at = NOW(),
      -- Update name if it's null or empty in public.users but available from OAuth
      name = CASE 
        WHEN name IS NULL OR name = '' THEN user_name
        ELSE name
      END
    WHERE id = existing_user_id;

    -- Create or update social connection
    INSERT INTO public.social_connections (
      user_id,
      platform,
      platform_user_id,
      profile_data,
      created_at,
      updated_at
    )
    VALUES (
      existing_user_id,
      oauth_provider,
      NEW.id::TEXT,
      jsonb_build_object(
        'email', NEW.email,
        'name', user_name,
        'avatar', NEW.raw_user_meta_data->>'avatar_url'
      )::TEXT,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, platform)
    DO UPDATE SET
      platform_user_id = NEW.id::TEXT,
      profile_data = jsonb_build_object(
        'email', NEW.email,
        'name', user_name,
        'avatar', NEW.raw_user_meta_data->>'avatar_url'
      )::TEXT,
      updated_at = NOW();

    RAISE NOTICE 'Linked OAuth account for email % to existing user ID %', normalized_email, existing_user_id;
  ELSE
    -- User doesn't exist: create a new user in public.users
    -- Generate a placeholder password hash (OAuth users don't need passwords)
    -- Using a fixed placeholder since OAuth users won't use password auth
    INSERT INTO public.users (
      email,
      password_hash,
      name,
      role,
      supabase_auth_user_id,
      created_at,
      updated_at
    )
    VALUES (
      normalized_email,
      -- Placeholder password hash (OAuth users don't use passwords)
      '$2a$10$' || SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 53),
      user_name,
      'member',
      NEW.id,
      NOW(),
      NOW()
    )
    RETURNING id INTO existing_user_id;

    -- Create social connection for new user
    INSERT INTO public.social_connections (
      user_id,
      platform,
      platform_user_id,
      profile_data,
      created_at,
      updated_at
    )
    VALUES (
      existing_user_id,
      oauth_provider,
      NEW.id::TEXT,
      jsonb_build_object(
        'email', NEW.email,
        'name', user_name,
        'avatar', NEW.raw_user_meta_data->>'avatar_url'
      )::TEXT,
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Created new user for OAuth account with email %', normalized_email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create the trigger on auth.users table
-- This trigger fires AFTER a new user is inserted into auth.users
DROP TRIGGER IF EXISTS link_oauth_user_trigger ON auth.users;

CREATE TRIGGER link_oauth_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.link_oauth_to_existing_user();

-- Step 4: Grant necessary permissions
-- The function needs to be able to read/write to public.users and public.social_connections
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT ALL ON public.social_connections TO postgres, service_role;

-- Note: This trigger will automatically run whenever a new user is created in auth.users
-- It will link OAuth accounts to existing email/password accounts based on email matching

