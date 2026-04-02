
-- Fix 1: visitor_sessions - replace permissive INSERT with restrictive policy
DROP POLICY IF EXISTS "Anyone can insert visitor_sessions" ON public.visitor_sessions;

CREATE POLICY "No direct inserts to visitor_sessions"
  ON public.visitor_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

-- Fix 2: site_stats - admin-only UPDATE policy
CREATE POLICY "Admins can update site_stats"
  ON public.site_stats
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 3: project_skills - admin-only UPDATE policy
CREATE POLICY "Admins can update project_skills"
  ON public.project_skills
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
