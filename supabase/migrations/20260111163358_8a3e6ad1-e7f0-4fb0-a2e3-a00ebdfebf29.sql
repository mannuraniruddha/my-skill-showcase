-- Drop and recreate the track_visitor function with UUID validation and rate limiting
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
  v_last_visit timestamp with time zone;
BEGIN
  -- Validate visitor_id is a valid UUID format (case-insensitive)
  IF p_visitor_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
    RAISE EXCEPTION 'Invalid visitor_id format: must be a valid UUID';
  END IF;

  -- Rate limiting: Check if this visitor_id was tracked in the last 5 minutes
  SELECT created_at INTO v_last_visit
  FROM visitor_sessions
  WHERE visitor_id = lower(p_visitor_id)
  ORDER BY created_at DESC
  LIMIT 1;

  -- If visited within last 5 minutes, just return current stats without incrementing
  IF v_last_visit IS NOT NULL AND v_last_visit > NOW() - INTERVAL '5 minutes' THEN
    SELECT stat_value INTO v_total_visits FROM site_stats WHERE stat_key = 'total_visits';
    SELECT stat_value INTO v_unique_visitors FROM site_stats WHERE stat_key = 'unique_visitors';
    
    RETURN QUERY SELECT 
      COALESCE(v_total_visits, 0),
      COALESCE(v_unique_visitors, 0),
      false;
    RETURN;
  END IF;

  -- Always increment total visits
  UPDATE site_stats 
  SET stat_value = stat_value + 1, updated_at = now()
  WHERE stat_key = 'total_visits'
  RETURNING stat_value INTO v_total_visits;
  
  -- Check if this is a new unique visitor (normalize to lowercase)
  IF NOT EXISTS (SELECT 1 FROM visitor_sessions WHERE visitor_id = lower(p_visitor_id)) THEN
    v_is_new_visitor := true;
    
    -- Insert new visitor session
    INSERT INTO visitor_sessions (visitor_id) VALUES (lower(p_visitor_id));
    
    -- Increment unique visitors count
    UPDATE site_stats 
    SET stat_value = stat_value + 1, updated_at = now()
    WHERE stat_key = 'unique_visitors'
    RETURNING stat_value INTO v_unique_visitors;
  ELSE
    -- Existing visitor - update their last visit timestamp
    UPDATE visitor_sessions 
    SET created_at = now() 
    WHERE visitor_id = lower(p_visitor_id);
    
    -- Get current unique visitors count
    SELECT stat_value INTO v_unique_visitors FROM site_stats WHERE stat_key = 'unique_visitors';
  END IF;
  
  RETURN QUERY SELECT 
    COALESCE(v_total_visits, 0),
    COALESCE(v_unique_visitors, 0),
    v_is_new_visitor;
END;
$$;