
-- First drop the trigger if it exists to avoid duplication
DROP TRIGGER IF EXISTS update_event_participants_trigger ON event_registrations;

-- Create an updated trigger function specifically for registrations
CREATE OR REPLACE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.events
    SET current_participants = COALESCE(current_participants, 0) + 1
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events
    SET current_participants = GREATEST(COALESCE(current_participants, 0) - 1, 0)
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER update_event_participants_trigger
AFTER INSERT OR DELETE ON event_registrations
FOR EACH ROW EXECUTE FUNCTION update_event_participants_count();

-- Grant permissions for the storage bucket creation
GRANT ALL ON SCHEMA storage TO postgres, anon, authenticated, service_role;
