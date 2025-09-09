-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- Suite, Presidential, Honeymoon, Family, Standard
  description TEXT,
  price_per_night INTEGER NOT NULL, -- in NAD cents
  max_guests INTEGER NOT NULL DEFAULT 2,
  amenities TEXT[] DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in NAD cents
  duration TEXT, -- e.g., "Full Day", "Half Day"
  location TEXT,
  max_participants INTEGER,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gallery table for room and activity images
CREATE TABLE public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type TEXT NOT NULL, -- 'room' or 'activity'
  item_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  number_of_guests INTEGER NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  total_amount INTEGER NOT NULL, -- in NAD cents
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  stripe_session_id TEXT,
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity bookings table
CREATE TABLE public.activity_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  number_of_participants INTEGER NOT NULL,
  total_amount INTEGER NOT NULL, -- in NAD cents
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  item_type TEXT NOT NULL, -- 'room' or 'activity'
  item_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for rooms (public read, admin manage)
CREATE POLICY "Anyone can view available rooms" ON public.rooms
FOR SELECT USING (is_available = true);

CREATE POLICY "Admins can manage rooms" ON public.rooms
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create policies for activities (public read, admin manage)
CREATE POLICY "Anyone can view available activities" ON public.activities
FOR SELECT USING (is_available = true);

CREATE POLICY "Admins can manage activities" ON public.activities
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create policies for gallery (public read, admin manage)
CREATE POLICY "Anyone can view gallery" ON public.gallery
FOR SELECT USING (true);

CREATE POLICY "Admins can manage gallery" ON public.gallery
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
FOR SELECT USING (auth.uid() = user_id OR guest_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Anyone can create bookings" ON public.bookings
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all bookings" ON public.bookings
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create policies for activity bookings
CREATE POLICY "Users can view their own activity bookings" ON public.activity_bookings
FOR SELECT USING (auth.uid() = user_id OR guest_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Anyone can create activity bookings" ON public.activity_bookings
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all activity bookings" ON public.activity_bookings
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create policies for ratings
CREATE POLICY "Anyone can view ratings" ON public.ratings
FOR SELECT USING (true);

CREATE POLICY "Users can create ratings" ON public.ratings
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage ratings" ON public.ratings
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON public.rooms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activity_bookings_updated_at
    BEFORE UPDATE ON public.activity_bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

-- Create storage policies
CREATE POLICY "Anyone can view gallery images" ON storage.objects
FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload gallery images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'gallery' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gallery images" ON storage.objects
FOR UPDATE USING (bucket_id = 'gallery' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery images" ON storage.objects
FOR DELETE USING (bucket_id = 'gallery' AND has_role(auth.uid(), 'admin'));

-- Insert sample rooms data
INSERT INTO public.rooms (name, type, description, price_per_night, max_guests, amenities) VALUES
('Presidential Suite', 'Presidential', 'Luxury suite with panoramic views, private balcony, and premium amenities', 350000, 4, '{"King bed", "Private balcony", "Mini bar", "Air conditioning", "Free WiFi", "Room service", "Jacuzzi"}'),
('Honeymoon Suite', 'Honeymoon', 'Romantic suite perfect for couples with intimate setting and special amenities', 250000, 2, '{"King bed", "Romantic decor", "Champagne on arrival", "Private dining", "Air conditioning", "Free WiFi"}'),
('Family Room', 'Family', 'Spacious room accommodating families with connecting areas and child-friendly amenities', 200000, 6, '{"Two double beds", "Sofa bed", "Mini fridge", "Air conditioning", "Free WiFi", "Family games"}'),
('Standard Suite', 'Suite', 'Comfortable suite with separate living area and essential amenities', 180000, 3, '{"Queen bed", "Separate lounge", "Mini bar", "Air conditioning", "Free WiFi", "Work desk"}'),
('Standard Room', 'Standard', 'Cozy room with all essential amenities for a comfortable stay', 120000, 2, '{"Double bed", "En-suite bathroom", "Air conditioning", "Free WiFi", "Tea/coffee facilities"}');

-- Insert sample activities data
INSERT INTO public.activities (name, description, price, duration, location, max_participants) VALUES
('Etosha Safari Tour', 'Full day safari experience in Etosha National Park with professional guide and game viewing', 150000, 'Full Day (8 hours)', 'Etosha National Park', 8),
('Cultural Village Visit', 'Authentic cultural experience visiting traditional Himba and Herero communities', 80000, 'Half Day (4 hours)', 'Local Villages', 12),
('Kavango River Safari', 'Scenic boat safari along the Kavango River with wildlife and bird watching', 120000, 'Half Day (4 hours)', 'Kavango River', 10),
('Caprivi Strip Fishing', 'Guided fishing experience in the pristine waters of the Caprivi Strip', 100000, 'Full Day (6 hours)', 'Caprivi Strip', 6),
('Bwabwata National Park Tour', 'Day trip exploring the diverse wildlife and landscapes of Bwabwata National Park', 130000, 'Full Day (7 hours)', 'Bwabwata National Park', 8);

-- Create function to calculate average ratings
CREATE OR REPLACE FUNCTION public.get_average_rating(p_item_type TEXT, p_item_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(AVG(rating), 0)::NUMERIC(3,2)
  FROM public.ratings 
  WHERE item_type = p_item_type AND item_id = p_item_id AND is_verified = true;
$$;