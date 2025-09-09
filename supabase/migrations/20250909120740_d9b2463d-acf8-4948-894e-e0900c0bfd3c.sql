-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 2,
  size_sqm INTEGER NOT NULL DEFAULT 25,
  price_nad INTEGER NOT NULL, -- Price in cents (NAD)
  amenities TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 10,
  price_nad INTEGER NOT NULL, -- Price in cents (NAD)
  category TEXT NOT NULL DEFAULT 'Adventure',
  difficulty_level TEXT NOT NULL DEFAULT 'Moderate',
  includes TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rating_type TEXT NOT NULL CHECK (rating_type IN ('room', 'activity')),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT rating_reference_check CHECK (
    (rating_type = 'room' AND room_id IS NOT NULL AND activity_id IS NULL) OR
    (rating_type = 'activity' AND activity_id IS NOT NULL AND room_id IS NULL)
  )
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('room', 'activity')),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE,
  guests_count INTEGER NOT NULL DEFAULT 1,
  total_amount_nad INTEGER NOT NULL, -- Amount in cents (NAD)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT booking_reference_check CHECK (
    (booking_type = 'room' AND room_id IS NOT NULL AND activity_id IS NULL) OR
    (booking_type = 'activity' AND activity_id IS NOT NULL AND room_id IS NULL)
  )
);

-- Create gallery table
CREATE TABLE public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (but keep open for now since no auth is implemented)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Create policies that allow public access for now
CREATE POLICY "Allow public read access to rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow public read access to activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Allow public read access to ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Allow public read access to gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Allow public insert to ratings" ON public.ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to bookings" ON public.bookings FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_updated_at
  BEFORE UPDATE ON public.gallery
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create functions for average ratings
CREATE OR REPLACE FUNCTION public.get_room_average_rating(room_uuid UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT COALESCE(AVG(rating::DECIMAL), 0)
    FROM public.ratings
    WHERE room_id = room_uuid AND rating_type = 'room'
  );
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_activity_average_rating(activity_uuid UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT COALESCE(AVG(rating::DECIMAL), 0)
    FROM public.ratings
    WHERE activity_id = activity_uuid AND rating_type = 'activity'
  );
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Insert sample rooms data
INSERT INTO public.rooms (name, description, capacity, size_sqm, price_nad, amenities, images, is_featured) VALUES
('Luxury Suite', 'Spacious suite with panoramic views of the Namibian landscape, featuring a king-size bed, private balcony, and luxury amenities.', 2, 45, 150000, 
 ARRAY['King-size bed', 'Private balcony', 'Air conditioning', 'Mini bar', 'Coffee machine', 'Safe', 'Bathrobes', 'Premium toiletries'], 
 ARRAY['/assets/suite-room.jpg'], true),
('Standard Room', 'Comfortable room with modern amenities and beautiful garden views, perfect for couples or solo travelers.', 2, 25, 95000,
 ARRAY['Queen bed', 'Garden view', 'Air conditioning', 'Tea/coffee facilities', 'Safe', 'En-suite bathroom'],
 ARRAY['/assets/suite-room.jpg'], false),
('Family Room', 'Spacious family accommodation with separate sleeping areas for children and adults.', 4, 35, 180000,
 ARRAY['King bed', 'Bunk beds', 'Family bathroom', 'Kitchenette', 'Living area', 'Air conditioning'],
 ARRAY['/assets/suite-room.jpg'], false);

-- Insert sample activities data  
INSERT INTO public.activities (name, description, duration, capacity, price_nad, category, difficulty_level, includes, images, is_featured) VALUES
('Desert Safari', 'Experience the breathtaking beauty of the Namib Desert with our guided safari tour, including wildlife viewing and stunning sunset photography.', '6 hours', 8, 85000, 'Adventure', 'Easy',
 ARRAY['Professional guide', 'Transportation', 'Refreshments', 'Photography stops', 'Wildlife viewing'],
 ARRAY['/assets/safari-activity.jpg'], true),
('Cultural Village Tour', 'Immerse yourself in local Namibian culture with visits to traditional villages and cultural demonstrations.', '4 hours', 12, 65000, 'Cultural', 'Easy',
 ARRAY['Local guide', 'Cultural demonstrations', 'Traditional crafts', 'Light refreshments'],
 ARRAY['/assets/safari-activity.jpg'], false),
('Hiking Adventure', 'Guided hiking through scenic landscapes with opportunities for wildlife spotting and photography.', '3 hours', 6, 45000, 'Adventure', 'Moderate',
 ARRAY['Professional guide', 'Safety equipment', 'Water and snacks', 'Photography opportunities'],
 ARRAY['/assets/safari-activity.jpg'], false);