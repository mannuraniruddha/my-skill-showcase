
## Plan to Fix All Security Issues

### 1. Fix Visitor Sessions INSERT Policy (Critical)
The current policy allows anyone to insert visitor sessions with `WITH CHECK (true)`. We need to add rate limiting or validation. Since this is used for anonymous visitor tracking, we'll implement a server-side approach:

- Create a database function that validates insert requests (rate limiting by visitor_id)
- Replace the permissive INSERT policy with one that calls this validation function
- This prevents attackers from flooding the table with fake data

### 2. Add Admin-Only UPDATE Policy for site_stats
Add an explicit UPDATE policy restricting modifications to admin users only:
```sql
CREATE POLICY "Admins can update site_stats"
ON public.site_stats
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
```

### 3. Add Admin-Only UPDATE Policy for project_skills
Add defense-in-depth UPDATE policy for the junction table:
```sql
CREATE POLICY "Admins can update project_skills"
ON public.project_skills
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
```

### 4. Enable Leaked Password Protection
Configure the auth settings to enable leaked password protection, which checks passwords against known breach databases.

### Implementation Summary
A single database migration will:
1. Drop the permissive `visitor_sessions` INSERT policy
2. Create a rate-limiting validation function
3. Add a new INSERT policy with rate limiting
4. Add UPDATE policies for `site_stats` and `project_skills`

Plus an auth configuration change to enable leaked password protection.
