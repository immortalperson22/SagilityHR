-- Function to assign default role to new users
CREATE OR REPLACE FUNCTION public.assign_default_role(p_user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert default role as applicant
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_uuid, 'applicant')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
