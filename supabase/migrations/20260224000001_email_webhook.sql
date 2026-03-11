-- Enable the HTTP extension to allow database webhooks
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- Create a function to trigger the approval email edge function
-- NOTE: Rotate the anon_key below if exposed
CREATE OR REPLACE FUNCTION public.handle_applicant_approval_email()
RETURNS trigger AS $$
DECLARE
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2aGllbWZoc2NkZXBqcnNjZnl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDI0NDAsImV4cCI6MjA4NDQ3ODQ0MH0.qtvqTR-qnwh_sz9qby5q7Kg5-zZOnQaY8aNGzOD1y6Y';
  supabase_url text := 'https://gvhiemfhscdepjrscfyw.supabase.co';
BEGIN
  -- Only trigger when status is changed to 'approved'
  IF (NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved')) THEN
    -- We call the Edge Function via HTTP POST with authentication headers
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_applicant_approved_email ON public.applicants;
CREATE TRIGGER on_applicant_approved_email
  AFTER UPDATE ON public.applicants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_applicant_approval_email();
