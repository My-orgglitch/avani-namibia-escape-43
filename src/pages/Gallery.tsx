import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Heart } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  category: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: galleryItems, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as GalleryItem[];
    },
  });

  const categories = ['all', 'landscape', 'wildlife', 'property', 'rooms', 'amenities'];
  
  const filteredItems = galleryItems?.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  ) || [];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading gallery...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10">
      {/* Hero Section */}
      <section className="bg-primary/10 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-primary">Photo Gallery</h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Discover the beauty of Namibia through our lens
          </p>
        </div>
      </section>

      <section className="py-16 px-4 max-w-6xl mx-auto">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category === 'all' ? 'All' : category}
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {item.is_featured && (
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                        Featured
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm opacity-90">{item.description}</p>
                      )}
                      <Badge variant="secondary" className="mt-2 capitalize text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No images found</h3>
            <p className="text-muted-foreground">
              {selectedCategory === 'all' 
                ? 'No images available in the gallery yet.' 
                : `No images found in the ${selectedCategory} category.`
              }
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Share Your Experience</h2>
              <p className="text-muted-foreground mb-6">
                Have you stayed with us? We'd love to see your photos! 
                Tag us on social media or send us your favorite memories.
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                Contact Us
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default Gallery;