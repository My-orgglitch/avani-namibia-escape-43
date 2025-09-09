import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Star, Camera, MapPin } from 'lucide-react';
import safariImage from '@/assets/safari-activity.jpg';
import { useActivities } from '@/hooks/useActivities';
import { RatingDisplay } from '@/components/RatingDisplay';
import { BookingModal } from '@/components/BookingModal';

const Activities = () => {
  const { data: activities, isLoading } = useActivities();
  const [selectedActivity, setSelectedActivity] = useState<{id: string; name: string; price: number} | null>(null);

  const formatPrice = (cents: number) => {
    return `From N$${(cents / 100).toFixed(0)}/person`;
  };

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-muted-foreground">Loading activities...</div>
      </div>
    );
  }

  const staticActivities = [
    {
      name: 'Etosha National Park Safari',
      image: safariImage,
      duration: 'Full Day',
      groupSize: '2-8 people',
      difficulty: 'Easy',
      price: 'From $180/person',
      rating: 4.9,
      description: 'Experience the incredible wildlife of Etosha National Park, home to elephants, lions, rhinos, and over 340 bird species.',
      highlights: ['Big Five Wildlife', 'Professional Guide', 'Game Drive Vehicle', 'Packed Lunch', 'Photography Opportunities'],
      featured: true
    },
    {
      name: 'Cultural Village Experience',
      image: safariImage,
      duration: 'Half Day',
      groupSize: '2-12 people',
      difficulty: 'Easy',
      price: 'From $120/person',
      rating: 4.8,
      description: 'Immerse yourself in traditional Namibian culture with visits to local homesteads and authentic cultural demonstrations.',
      highlights: ['Traditional Dancing', 'Local Crafts', 'Village Tour', 'Cultural Storytelling', 'Authentic Lunch']
    },
    {
      name: 'Kavango River Safari',
      image: safariImage,
      duration: 'Half Day',
      groupSize: '2-10 people',
      difficulty: 'Easy',
      price: 'From $150/person',
      rating: 4.7,
      description: 'Explore the pristine waters of the Kavango River by boat, spotting hippos, crocodiles, and diverse birdlife.',
      highlights: ['Boat Safari', 'River Wildlife', 'Bird Watching', 'Scenic Views', 'Refreshments']
    },
    {
      name: 'Caprivi Strip Fishing',
      image: safariImage,
      duration: 'Full Day',
      groupSize: '2-6 people',
      difficulty: 'Moderate',
      price: 'From $200/person',
      rating: 4.6,
      description: 'Try your hand at catching tiger fish and bream in the beautiful rivers of the Caprivi Strip.',
      highlights: ['Fishing Equipment', 'Expert Guide', 'Lunch by River', 'Scenic Location', 'Fish Preparation']
    },
    {
      name: 'Bwabwata National Park',
      image: safariImage,
      duration: 'Full Day',
      groupSize: '2-8 people',
      difficulty: 'Easy',
      price: 'From $160/person',
      rating: 4.8,
      description: 'Discover the unique ecosystem where the Kalahari Desert meets the Okavango Delta.',
      highlights: ['Diverse Ecosystems', 'Wildlife Viewing', 'Walking Safaris', 'Professional Guide', 'Picnic Lunch']
    },
    {
      name: 'Okavango Delta Day Trip',
      image: safariImage,
      duration: 'Full Day',
      groupSize: '2-10 people',
      difficulty: 'Easy',
      price: 'From $220/person',
      rating: 4.9,
      description: 'Venture into the world-famous Okavango Delta for an unforgettable wetland experience.',
      highlights: ['Mokoro Rides', 'Water Birds', 'Delta Wildlife', 'Local Guide', 'Traditional Lunch']
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Challenging': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-playfair font-bold text-foreground mb-6">
            Northern Namibia Adventures
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover the untouched wilderness and rich cultural heritage of Northern and Eastern Namibia. 
            From world-class safaris to authentic cultural experiences, every adventure is carefully curated.
          </p>
        </div>
      </section>

      {/* Activities Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {activities?.map((activity) => (
              <Card key={activity.id} className="luxury-card overflow-hidden border-0">
                <div className="image-hover aspect-[16/10] relative">
                  <img
                    src={activity.images?.[0] || safariImage}
                    alt={activity.name}
                    className="w-full h-full object-cover"
                  />
                  {activity.is_featured && (
                    <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}
                  <div className="absolute top-4 right-4 bg-secondary/80 backdrop-blur-sm rounded-full px-3 py-1">
                    <RatingDisplay type="activity" itemId={activity.id} className="text-white" />
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-playfair font-bold text-foreground">
                      {activity.name}
                    </h3>
                    <div className="text-right">
                      <div className="text-lg font-playfair font-bold text-primary">
                        {formatPrice(activity.price_nad)}
                      </div>
                    </div>
                  </div>

                  {/* Activity Details */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{activity.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{activity.max_group_size} people</span>
                    </div>
                    <Badge className={getDifficultyColor(activity.difficulty)}>
                      {activity.difficulty}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {activity.description}
                  </p>

                  {/* Highlights */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center">
                      <Camera className="w-4 h-4 mr-2 text-primary" />
                      What's Included
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {activity.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      size="lg" 
                      className="btn-luxury bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
                      onClick={() => setSelectedActivity({
                        id: activity.id,
                        name: activity.name,
                        price: activity.price_nad
                      })}
                    >
                      Book Experience
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="btn-luxury"
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {selectedActivity && (
        <BookingModal
          isOpen={!!selectedActivity}
          onClose={() => setSelectedActivity(null)}
          bookingType="activity"
          itemId={selectedActivity.id}
          itemName={selectedActivity.name}
          priceNad={selectedActivity.price}
        />
      )}

      {/* Why Choose Us */}
      <section className="py-16 bg-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-playfair font-bold text-foreground mb-4">
              Why Choose Our Tours
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're committed to providing authentic, sustainable, and unforgettable experiences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-playfair font-semibold text-foreground mb-2">Expert Guides</h3>
              <p className="text-muted-foreground">Local professional guides with extensive knowledge of wildlife and culture</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-playfair font-semibold text-foreground mb-2">Prime Locations</h3>
              <p className="text-muted-foreground">Access to the best wildlife viewing areas and cultural sites</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-playfair font-semibold text-foreground mb-2">5-Star Service</h3>
              <p className="text-muted-foreground">Premium service and attention to detail in every experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="py-16 bg-secondary text-secondary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-playfair font-bold mb-4">
            Ready for Your Adventure?
          </h2>
          <p className="text-lg text-secondary-foreground/80 mb-8">
            Contact our experienced team to plan your perfect Namibian adventure. 
            We'll customize your itinerary based on your interests and preferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="btn-luxury bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              Plan My Adventure
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="btn-luxury border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary px-8"
            >
              Call +264 66 267 800 / +264 81 233 391 5
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Activities;