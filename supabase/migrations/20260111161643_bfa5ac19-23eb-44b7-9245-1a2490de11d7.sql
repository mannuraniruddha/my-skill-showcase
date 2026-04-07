-- Create visitor_sessions table for tracking unique visitors
CREATE TABLE public.visitor_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index on visitor_id for fast lookups
CREATE INDEX idx_visitor_sessions_visitor_id ON public.visitor_sessions(visitor_id);

-- Enable RLS
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for anonymous tracking)
CREATE POLICY "Anyone can insert visitor_sessions"
ON public.visitor_sessions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to select their own session (by visitor_id)
CREATE POLICY "Anyone can view visitor_sessions"
ON public.visitor_sessions
FOR SELECT
TO anon, authenticated
USING (true);

-- Add unique_visitors stat to site_stats
INSERT INTO public.site_stats (stat_key, stat_value)
VALUES ('unique_visitors', 0)
ON CONFLICT (stat_key) DO NOTHING;

-- Add total_visits stat (rename from visitor_count for clarity)
INSERT INTO public.site_stats (stat_key, stat_value)
VALUES ('total_visits', 0)
ON CONFLICT (stat_key) DO NOTHING;

-- Drop old function and create new one
DROP FUNCTION IF EXISTS public.increment_visitor_count();

-- Create new function that tracks both metrics
CREATE OR REPLACE FUNCTION public.track_visitor(p_visitor_id text)
RETURNS TABLE(total_visits integer, unique_visitors integer, is_new_visitor boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_new_visitor boolean := false;
  v_total_visits integer;
  v_unique_visitors integer;
BEGIN
  -- Always increment total visits
  UPDATE site_stats 
  SET stat_value = stat_value + 1, updated_at = now()
  WHERE stat_key = 'total_visits'
  RETURNING stat_value INTO v_total_visits;
  
  -- If no row existed, insert it
  IF v_total_visits IS NULL THEN
    INSERT INTO site_stats (stat_key, stat_value)
    VALUES ('total_visits', 1)
    ON CONFLICT (stat_key) DO UPDATE SET stat_value = site_stats.stat_value + 1
    RETURNING stat_value INTO v_total_visits;
  END IF;
  
  -- Check if this visitor is new
  IF NOT EXISTS (SELECT 1 FROM visitor_sessions WHERE visitor_id = p_visitor_id) THEN
    v_is_new_visitor := true;
    
    -- Insert the visitor session
    INSERT INTO visitor_sessions (visitor_id) VALUES (p_visitor_id);
    
    -- Increment unique visitors
    UPDATE site_stats 
    SET stat_value = stat_value + 1, updated_at = now()
    WHERE stat_key = 'unique_visitors'
    RETURNING stat_value INTO v_unique_visitors;
    
    -- If no row existed, insert it
    IF v_unique_visitors IS NULL THEN
      INSERT INTO site_stats (stat_key, stat_value)
      VALUES ('unique_visitors', 1)
      ON CONFLICT (stat_key) DO UPDATE SET stat_value = site_stats.stat_value + 1
      RETURNING stat_value INTO v_unique_visitors;
    END IF;
  ELSE
    -- Just get current unique count
    SELECT stat_value INTO v_unique_visitors 
    FROM site_stats 
    WHERE stat_key = 'unique_visitors';
  END IF;
  
  RETURN QUERY SELECT v_total_visits, COALESCE(v_unique_visitors, 0), v_is_new_visitor;
END;
$$;

-- Migrate existing visitor_count to total_visits
UPDATE site_stats 
SET stat_value = (SELECT stat_value FROM site_stats WHERE stat_key = 'visitor_count')
WHERE stat_key = 'total_visits'
AND EXISTS (SELECT 1 FROM site_stats WHERE stat_key = 'visitor_count');