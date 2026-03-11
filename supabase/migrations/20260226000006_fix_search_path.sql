-- Fix: Add search_path to all database functions
-- This resolves the lint warning about mutable search_path

-- Fix 1: handle_applicant_approval_email
-- NOTE: Rotate the anon_key below if exposed
CREATE OR REPLACE FUNCTION public.handle_applicant_approval_email()
RETURNS trigger 
SET search_path = public, pg_temp
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2aGllbWZoc2NkZXBqcnNjZnl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDI0NDAsImV4cCI6MjA4NDQ3ODQ0MH0.qtvqTR-qnwh_sz9qby5q7Kg5-zZOnQaY8aNGzOD1y6Y';
  supabase_url text := 'https://gvhiemfhscdepjrscfyw.supabase.co';
BEGIN
  IF (NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved')) THEN
    PERFORM
      extensions.http((
        'POST',
        supabase_url || '/functions/v1/send-approval-email',
        ARRAY[extensions.http_header('apikey', anon_key),
              extensions.http_header('Authorization', 'Bearer ' || anon_key)],
        'application/json',
        jsonb_build_object(
          'record', row_to_json(NEW),
          'type', 'UPDATE',
          'table', 'applicants'
        )::text
      )::extensions.http_request);
  END IF;
  RETURN NEW;
END;
$$;

-- Fix 2: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SET search_path = public, pg_temp
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'applicant')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Fix 3: assign_default_role
CREATE OR REPLACE FUNCTION public.assign_default_role(p_user_uuid UUID)
RETURNS void
SET search_path = public, pg_temp
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_uuid, 'applicant')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
