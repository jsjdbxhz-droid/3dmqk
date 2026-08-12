/*
# 3D Model App - Full Schema

Creates the complete database schema for a 3D model generation app with:
- User profiles with plan tiers (free/pro/ultra) and credit balances
- 3D model records (generated from images or text)
- User app settings (background color, language)
- Admin functions for managing users, assigning plans, and granting credits

## Tables
- profiles: user profile with plan, credits, admin flag
- models: generated 3D models (multi_image, single_image, text)
- user_settings: background color and language preferences

## Security
- RLS enabled on all tables
- Users can CRUD own data
- Admins can read all profiles and models

## Admin Functions (SECURITY DEFINER)
- is_admin(): check if current user is admin
- admin_get_all_profiles(): list all profiles
- admin_update_user_plan(): update user plan + credits
- admin_grant_credits(): add credits to user
- admin_set_admin(): set admin status
- admin_grant_panel(): grant plan + custom credits
- deduct_credits(): deduct credits for model generation

## Notes
- New users get 25 credits (free plan) via trigger
- Each model generation costs 5 credits
- Plan credit allocations: free=25, pro=750, ultra=1250
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text DEFAULT '',
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'ultra')),
  credits integer NOT NULL DEFAULT 25,
  is_admin boolean NOT NULL DEFAULT false,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('multi_image', 'single_image', 'text')),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  input_images text[] DEFAULT '{}',
  input_text text,
  model_url text,
  thumbnail_url text,
  credits_used integer NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_models" ON models;
CREATE POLICY "select_own_models" ON models FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "insert_own_models" ON models;
CREATE POLICY "insert_own_models" ON models FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_models" ON models;
CREATE POLICY "update_own_models" ON models FOR UPDATE
  TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_models" ON models;
CREATE POLICY "delete_own_models" ON models FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  background_color text NOT NULL DEFAULT '#0f172a',
  language text NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ar')),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_settings" ON user_settings;
CREATE POLICY "select_own_settings" ON user_settings FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_settings" ON user_settings;
CREATE POLICY "insert_own_settings" ON user_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_settings" ON user_settings;
CREATE POLICY "update_own_settings" ON user_settings FOR UPDATE
  TO authenticated USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_settings" ON user_settings;
CREATE POLICY "delete_own_settings" ON user_settings FOR DELETE
  TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, plan, credits)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', ''), 'free', 25)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO user_settings (id, background_color, language)
  VALUES (NEW.id, '#0f172a', 'en')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION admin_get_all_profiles()
RETURNS TABLE (
  id uuid,
  email text,
  display_name text,
  plan text,
  credits integer,
  is_admin boolean,
  avatar_url text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;
  RETURN QUERY SELECT * FROM profiles ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION admin_update_user_plan(target_user uuid, new_plan text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_credits integer;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  new_credits := CASE new_plan
    WHEN 'free' THEN 25
    WHEN 'pro' THEN 750
    WHEN 'ultra' THEN 1250
    ELSE 25
  END;

  UPDATE profiles SET plan = new_plan, credits = new_credits WHERE id = target_user;
END;
$$;

CREATE OR REPLACE FUNCTION admin_grant_credits(target_user uuid, amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;
  UPDATE profiles SET credits = credits + amount WHERE id = target_user;
END;
$$;

CREATE OR REPLACE FUNCTION admin_set_admin(target_user uuid, new_is_admin boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;
  UPDATE profiles SET is_admin = new_is_admin WHERE id = target_user;
END;
$$;

CREATE OR REPLACE FUNCTION admin_grant_panel(target_user uuid, new_plan text, new_credits integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;
  UPDATE profiles SET plan = new_plan, credits = new_credits WHERE id = target_user;
END;
$$;

CREATE OR REPLACE FUNCTION deduct_credits(amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  current_credits integer;
BEGIN
  SELECT credits INTO current_credits FROM profiles WHERE id = auth.uid();
  IF current_credits IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  IF current_credits < amount THEN
    RETURN false;
  END IF;
  UPDATE profiles SET credits = credits - amount WHERE id = auth.uid();
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_user_plan(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_grant_credits(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_set_admin(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_grant_panel(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_credits(integer) TO authenticated;
