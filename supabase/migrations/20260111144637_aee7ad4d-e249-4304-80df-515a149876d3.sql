-- Create table to store site statistics
CREATE TABLE public.site_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_key text NOT NULL UNIQUE,
  stat_value integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read stats (public)
CREATE POLICY "Anyone can view site_stats" 
  ON public.site_stats FOR SELECT 
  USING (true);

-- Insert initial visitor count
INSERT INTO public.site_stats (stat_key, stat_value) 
VALUES ('visitor_count', 0);

-- Create function to safely increment count
CREATE OR REPLACE FUNCTION public.increment_visitor_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE public.site_stats 
  SET stat_value = stat_value + 1, updated_at = now()
  WHERE stat_key = 'visitor_count'
  RETURNING stat_value INTO new_count;
  
  RETURN new_count;
END;
$$;