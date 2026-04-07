-- Drop the public SELECT policy on visitor_sessions
DROP POLICY IF EXISTS "Anyone can view visitor_sessions" ON public.visitor_sessions;

-- Add admin-only SELECT policy
CREATE POLICY "Admins can view visitor_sessions"
ON public.visitor_sessions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));