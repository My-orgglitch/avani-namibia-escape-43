-- Create comprehensive database schema for guesthouse booking system
-- Skip bucket creation as they already exist

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  nationality TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL,
  size_sqm INTEGER,
  price_nad INTEGER NOT NULL, -- Price in Namibian dollars (cents)
  amenities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]', -- Array of image URLs
  is_featured BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activities table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration TEXT NOT NULL,
  max_group_size INTEGER NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Moderate', 'Challenging')),
  price_nad INTEGER NOT NULL, -- Price in Namibian dollars (cents)
  highlights JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]', -- Array of image URLs
  is_featured BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_type TEXT CHECK (booking_type IN ('room', 'activity')),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  check_in_date DATE,
  check_out_date DATE,
  activity_date DATE,
  number_of_guests INTEGER NOT NULL,
  total_amount_nad INTEGER NOT NULL, -- Total in Namibian dollars (cents)
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'refunded')),
  stripe_payment_intent_id TEXT,
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_booking_type CHECK (
    (booking_type = 'room' AND room_id IS NOT NULL AND activity_id IS NULL AND check_in_date IS NOT NULL AND check_out_date IS NOT NULL) OR
    (booking_type = 'activity' AND activity_id IS NOT NULL AND room_id IS NULL AND activity_date IS NOT NULL)
  )
);

-- Ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  rating_type TEXT CHECK (rating_type IN ('room', 'activity')),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  guest_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_rating_type CHECK (
    (rating_type = 'room' AND room_id IS NOT NULL AND activity_id IS NULL) OR
    (rating_type = 'activity' AND activity_id IS NOT NULL AND room_id IS NULL)
  ),
  UNIQUE(booking_id)
);

-- Gallery table
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'rooms', 'activities', 'dining', 'grounds')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email notifications table
CREATE TABLE public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('booking_confirmation', 'payment_confirmation', 'reminder', 'cancellation')),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for rooms (public read, admin write)
CREATE POLICY "Anyone can view available rooms" ON public.rooms
FOR SELECT USING (is_available = true);

CREATE POLICY "Authenticated users can view all rooms" ON public.rooms
FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for activities (public read, admin write)
CREATE POLICY "Anyone can view available activities" ON public.activities
FOR SELECT USING (is_available = true);

CREATE POLICY "Authenticated users can view all activities" ON public.activities
FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings" ON public.bookings
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own bookings" ON public.bookings
FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for ratings
CREATE POLICY "Anyone can view ratings" ON public.ratings
FOR SELECT USING (true);

CREATE POLICY "Users can create ratings for their bookings" ON public.ratings
FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for gallery
CREATE POLICY "Anyone can view gallery" ON public.gallery
FOR SELECT USING (true);

-- RLS Policies for email notifications
CREATE POLICY "Users can view their own email notifications" ON public.email_notifications
FOR SELECT USING (
  booking_id IN (SELECT id FROM public.bookings WHERE user_id = auth.uid())
);

-- Functions to calculate average ratings
CREATE OR REPLACE FUNCTION get_room_average_rating(room_uuid UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT COALESCE(ROUND(AVG(rating), 1), 0)
    FROM public.ratings 
    WHERE room_id = room_uuid AND rating_type = 'room'
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_activity_average_rating(activity_uuid UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT COALESCE(ROUND(AVG(rating), 1), 0)
    FROM public.ratings 
    WHERE activity_id = activity_uuid AND rating_type = 'activity'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for rooms
INSERT INTO public.rooms (name, description, capacity, size_sqm, price_nad, amenities, is_featured) VALUES
('Presidential Suite', 'Our most luxurious accommodation featuring a separate living area, private balcony with panoramic views, and premium amenities.', 2, 75, 675000, '["King Size Bed", "Private Balcony", "Living Area", "Marble Bathroom", "Butler Service", "Mini Bar"]', true),
('Luxury Suite', 'Elegantly appointed suite with modern amenities and authentic African design elements.', 2, 55, 480000, '["Queen Size Bed", "Sitting Area", "Premium Bathroom", "Work Desk", "Mini Bar", "Air Conditioning"]', false),
('Honeymoon Suite', 'Romantic retreat perfect for couples, featuring intimate lighting and luxurious appointments.', 2, 60, 570000, '["King Size Bed", "Romantic Decor", "Jacuzzi Bath", "Private Terrace", "Champagne Service", "Rose Petals"]', false),
('Family Room', 'Spacious accommodation perfect for families, with flexible sleeping arrangements and child-friendly amenities.', 4, 65, 420000, '["Twin Beds + Sofa Bed", "Family Bathroom", "Children Amenities", "Extra Space", "Mini Fridge", "Safe"]', false),
('Standard Room', 'Comfortable and well-appointed room with all essential amenities for a pleasant stay.', 2, 35, 270000, '["Queen Size Bed", "En-suite Bathroom", "Work Area", "Air Conditioning", "TV", "Tea/Coffee"]', false);

-- Insert sample data for activities
INSERT INTO public.activities (name, description, duration, max_group_size, difficulty, price_nad, highlights, is_featured) VALUES
('Etosha National Park Safari', 'Experience the incredible wildlife of Etosha National Park, home to elephants, lions, rhinos, and over 340 bird species.', 'Full Day', 8, 'Easy', 270000, '["Big Five Wildlife", "Professional Guide", "Game Drive Vehicle", "Packed Lunch", "Photography Opportunities"]', true),
('Cultural Village Experience', 'Immerse yourself in traditional Namibian culture with visits to local homesteads and authentic cultural demonstrations.', 'Half Day', 12, 'Easy', 180000, '["Traditional Dancing", "Local Crafts", "Village Tour", "Cultural Storytelling", "Authentic Lunch"]', false),
('Kavango River Safari', 'Explore the pristine waters of the Kavango River by boat, spotting hippos, crocodiles, and diverse birdlife.', 'Half Day', 10, 'Easy', 225000, '["Boat Safari", "River Wildlife", "Bird Watching", "Scenic Views", "Refreshments"]', false),
('Caprivi Strip Fishing', 'Try your hand at catching tiger fish and bream in the beautiful rivers of the Caprivi Strip.', 'Full Day', 6, 'Moderate', 300000, '["Fishing Equipment", "Expert Guide", "Lunch by River", "Scenic Location", "Fish Preparation"]', false),
('Bwabwata National Park', 'Discover the unique ecosystem where the Kalahari Desert meets the Okavango Delta.', 'Full Day', 8, 'Easy', 240000, '["Diverse Ecosystems", "Wildlife Viewing", "Walking Safaris", "Professional Guide", "Picnic Lunch"]', false),
('Okavango Delta Day Trip', 'Venture into the world-famous Okavango Delta for an unforgettable wetland experience.', 'Full Day', 10, 'Easy', 330000, '["Mokoro Rides", "Water Birds", "Delta Wildlife", "Local Guide", "Traditional Lunch"]', false);

-- Insert sample ratings for realistic data
INSERT INTO public.ratings (rating_type, room_id, rating, review_text, guest_name, user_id) VALUES
('room', (SELECT id FROM public.rooms WHERE name = 'Presidential Suite'), 5, 'Absolutely stunning suite with incredible views. The service was impeccable.', 'Sarah Johnson', NULL),
('room', (SELECT id FROM public.rooms WHERE name = 'Presidential Suite'), 5, 'Perfect for our honeymoon. Every detail was thoughtfully arranged.', 'Michael Chen', NULL),
('room', (SELECT id FROM public.rooms WHERE name = 'Luxury Suite'), 5, 'Beautiful room with authentic African touches. Very comfortable.', 'Emma Wilson', NULL),
('room', (SELECT id FROM public.rooms WHERE name = 'Luxury Suite'), 4, 'Great room, loved the design. Minor issue with AC but quickly resolved.', 'David Brown', NULL),
('room', (SELECT id FROM public.rooms WHERE name = 'Honeymoon Suite'), 5, 'Most romantic setting ever! The jacuzzi was perfect.', 'Lisa Garcia', NULL),
('room', (SELECT id FROM public.rooms WHERE name = 'Family Room'), 5, 'Perfect for our family of four. Kids loved the space.', 'Robert Taylor', NULL),
('room', (SELECT id FROM public.rooms WHERE name = 'Standard Room'), 4, 'Clean, comfortable, and good value. Would stay again.', 'Maria Rodriguez', NULL);

INSERT INTO public.ratings (rating_type, activity_id, rating, review_text, guest_name, user_id) VALUES
('activity', (SELECT id FROM public.activities WHERE name = 'Etosha National Park Safari'), 5, 'Incredible wildlife viewing! Saw all Big Five animals. Guide was amazing.', 'John Smith', NULL),
('activity', (SELECT id FROM public.activities WHERE name = 'Etosha National Park Safari'), 5, 'Best safari experience ever. Professional guide and excellent lunch.', 'Anna Lee', NULL),
('activity', (SELECT id FROM public.activities WHERE name = 'Cultural Village Experience'), 5, 'Authentic and educational. Learned so much about local culture.', 'Peter Jones', NULL),
('activity', (SELECT id FROM public.activities WHERE name = 'Cultural Village Experience'), 4, 'Very interesting cultural experience. Food was delicious.', 'Sophie Martin', NULL),
('activity', (SELECT id FROM public.activities WHERE name = 'Kavango River Safari'), 5, 'Amazing boat safari! Saw hippos and beautiful birds.', 'Tom Anderson', NULL),
('activity', (SELECT id FROM public.activities WHERE name = 'Caprivi Strip Fishing'), 4, 'Great fishing experience. Caught some beautiful fish.', 'Chris Wilson', NULL),
('activity', (SELECT id FROM public.activities WHERE name = 'Okavango Delta Day Trip'), 5, 'Absolutely magical! The mokoro rides were unforgettable.', 'Julia Davis', NULL);