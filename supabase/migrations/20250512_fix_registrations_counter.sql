
-- First drop the existing trigger if it exists
DROP TRIGGER IF EXISTS update_event_participants_trigger ON event_registrations;

-- Create an updated trigger function with better handling to avoid duplicate counts
CREATE OR REPLACE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Add a small delay to prevent race conditions in concurrent operations
  PERFORM pg_sleep(0.01);
  
  IF TG_OP = 'INSERT' THEN
    -- Explicitly lock the row to prevent concurrent updates
    PERFORM id FROM public.events 
    WHERE id = NEW.event_id
    FOR UPDATE;
    
    UPDATE public.events
    SET current_participants = (
      SELECT COUNT(*) 
      FROM event_registrations 
      WHERE event_id = NEW.event_id
    )
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Explicitly lock the row to prevent concurrent updates
    PERFORM id FROM public.events 
    WHERE id = OLD.event_id
    FOR UPDATE;
    
    UPDATE public.events
    SET current_participants = (
      SELECT COUNT(*) 
      FROM event_registrations 
      WHERE event_id = OLD.event_id
    )
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER update_event_participants_trigger
AFTER INSERT OR DELETE ON event_registrations
FOR EACH ROW EXECUTE FUNCTION update_event_participants_count();
