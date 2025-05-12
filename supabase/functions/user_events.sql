
-- Functions to work around type issues with the user_events and game_results tables

-- Get user events
CREATE OR REPLACE FUNCTION get_user_events(user_id_param UUID)
RETURNS SETOF user_events
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * 
  FROM user_events 
  WHERE user_id = user_id_param
  ORDER BY date DESC;
$$;

-- Create user event
CREATE OR REPLACE FUNCTION create_user_event(
  name_param TEXT,
  date_param TIMESTAMPTZ,
  user_id_param UUID
)
RETURNS user_events
LANGUAGE SQL
SECURITY DEFINER
AS $$
  INSERT INTO user_events (name, date, user_id)
  VALUES (name_param, date_param, user_id_param)
  RETURNING *;
$$;

-- Update user event
CREATE OR REPLACE FUNCTION update_user_event(
  event_id_param UUID,
  name_param TEXT,
  date_param TIMESTAMPTZ
)
RETURNS user_events
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE user_events
  SET 
    name = name_param,
    date = date_param
  WHERE id = event_id_param
  RETURNING *;
$$;

-- Delete user event
CREATE OR REPLACE FUNCTION delete_user_event(event_id_param UUID)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  DELETE FROM game_results
  WHERE event_id = event_id_param;
  
  DELETE FROM user_events
  WHERE id = event_id_param;
$$;

-- Get user games
CREATE OR REPLACE FUNCTION get_user_games(user_id_param UUID)
RETURNS SETOF game_results
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * 
  FROM game_results 
  WHERE user_id = user_id_param
  ORDER BY date DESC;
$$;

-- Create game result
CREATE OR REPLACE FUNCTION create_game_result(
  event_id_param UUID,
  win_param BOOLEAN,
  opponent_deck_name_param TEXT,
  opponent_deck_format_param TEXT,
  deck_used_param TEXT,
  notes_param TEXT,
  date_param TIMESTAMPTZ,
  match_score_param JSONB,
  user_id_param UUID
)
RETURNS game_results
LANGUAGE SQL
SECURITY DEFINER
AS $$
  INSERT INTO game_results (
    event_id, 
    win, 
    opponent_deck_name, 
    opponent_deck_format, 
    deck_used, 
    notes, 
    date, 
    match_score,
    user_id
  )
  VALUES (
    event_id_param, 
    win_param, 
    opponent_deck_name_param, 
    opponent_deck_format_param, 
    deck_used_param, 
    notes_param, 
    date_param, 
    match_score_param,
    user_id_param
  )
  RETURNING *;
$$;
