-- Applicants table for document submission workflow
CREATE TABLE IF NOT EXISTS public.applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  pre_employment_url TEXT,
  policy_rules_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'revision_required', 'approved', 'rejected')),
  admin_comment TEXT
);

-- Enable RLS
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;

-- Policy: Applicants can view their own record
CREATE POLICY "Applicants can view own record"
ON public.applicants FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Applicants can update their own record
CREATE POLICY "Applicants can update own record"
ON public.applicants FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Applicants can insert their own record
CREATE POLICY "Applicants can insert own record"
ON public.applicants FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all
CREATE POLICY "Admins can view all applicants"
ON public.applicants FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Policy: Admins can update all
CREATE POLICY "Admins can update all applicants"
ON public.applicants FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Policy: Admins can insert
CREATE POLICY "Admins can insert applicant records"
ON public.applicants FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
