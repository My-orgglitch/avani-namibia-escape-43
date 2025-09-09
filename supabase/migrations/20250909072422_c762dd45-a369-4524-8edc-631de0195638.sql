-- Fix function search path security warnings

-- Drop and recreate rating functions with proper search_path
DROP FUNCTION IF EXISTS get_room_average_rating(UUID);
DROP FUNCTION IF EXISTS get_activity_average_rating(UUID);

CREATE OR REPLACE FUNCTION get_room_average_rating(room_uuid UUID)
RETURNS DECIMAL 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(ROUND(AVG(rating), 1), 0)
    FROM public.ratings 
    WHERE room_id = room_uuid AND rating_type = 'room'
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_activity_average_rating(activity_uuid UUID)
RETURNS DECIMAL 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(ROUND(AVG(rating), 1), 0)
    FROM public.ratings 
    WHERE activity_id = activity_uuid AND rating_type = 'activity'
  );
END;
$$;