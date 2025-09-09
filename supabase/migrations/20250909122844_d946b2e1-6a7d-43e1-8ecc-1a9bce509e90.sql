-- Update rooms with new images
UPDATE rooms 
SET images = ARRAY[
  '/src/assets/room-luxury-suite.jpg',
  '/src/assets/room-bathroom.jpg',
  '/src/assets/room-balcony.jpg',
  '/src/assets/room-executive.jpg',
  '/src/assets/room-family.jpg'
]
WHERE name = 'Luxury Safari Suite';

UPDATE rooms 
SET images = ARRAY[
  '/src/assets/room-family.jpg',
  '/src/assets/room-bathroom.jpg',
  '/src/assets/room-balcony.jpg'
]
WHERE name = 'Standard Room';

UPDATE rooms 
SET images = ARRAY[
  '/src/assets/room-executive.jpg',
  '/src/assets/room-luxury-suite.jpg',
  '/src/assets/room-bathroom.jpg'
]
WHERE name = 'Executive Room';

-- Add gallery items
INSERT INTO gallery (title, description, image_url, category, is_featured, sort_order) VALUES
('Namibian Desert Landscape', 'Stunning red sand dunes at golden hour', '/src/assets/gallery-desert.jpg', 'landscape', true, 1),
('Wildlife Safari', 'Majestic elephants in their natural habitat', '/src/assets/gallery-wildlife.jpg', 'wildlife', true, 2),
('Guesthouse Exterior', 'Modern architecture with traditional Namibian elements', '/src/assets/gallery-guesthouse.jpg', 'property', false, 3),
('Luxury Suite Interior', 'Elegant room with panoramic views', '/src/assets/room-luxury-suite.jpg', 'rooms', false, 4),
('Relaxing Balcony', 'Perfect spot to enjoy Namibian sunsets', '/src/assets/room-balcony.jpg', 'amenities', false, 5);