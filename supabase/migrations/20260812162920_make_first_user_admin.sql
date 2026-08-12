/*
# Make first user admin

Updates the handle_new_user trigger to automatically make the very first user an admin.
Subsequent users will not be admin by default.

## Changes
- Modified handle_new_user function to check if this is the first user
- If profiles table is empty, the new user gets is_admin = true
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count integer;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;

  INSERT INTO profiles (id, email, display_name, plan, credits, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    'free',
    25,
    user_count = 0
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO user_settings (id, background_color, language)
  VALUES (NEW.id, '#0f172a', 'en')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
