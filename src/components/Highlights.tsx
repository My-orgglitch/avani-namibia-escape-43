import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bed, Utensils, Camera, MapPin } from 'lucide-react';
import suiteImage from '@/assets/suite-room.jpg';
import restaurantImage from '@/assets/restaurant.jpg';
import safariImage from '@/assets/safari-activity.jpg';

const Highlights = () => {
  const highlights = [
    {
      icon: Bed,
      title: 'Luxury Accommodations',
      description: 'From intimate suites to spacious family rooms, each space is thoughtfully designed with modern amenities and authentic African touches.',
      image: suiteImage,
      link: '/rooms',
      buttonText: 'View Rooms'
    },
    {
      icon: Utensils,
      title: 'Exceptional Dining',
      description: 'Savor contemporary cuisine with local influences at our signature restaurant, complemented by an extensive wine selection.',
      image: restaurantImage,
      link: '/dining',
      buttonText: 'Discover Dining'
    },
    {
      icon: Camera,
      title: 'Safari Adventures',
      description: 'Explore Etosha National Park, experience traditional villages, and discover the pristine wilderness of Northern Namibia.',
      image: safariImage,
      link: '/activities',
      buttonText: 'Plan Activities'
    },
    {
      icon: MapPin,
      title: 'Prime Location',
      description: 'Perfectly positioned for exploring Namibia\'s natural wonders, cultural heritage, and unforgettable wildlife encounters.',
      image: safariImage,
      link: '/contact',
      buttonText: 'Get Directions'
    }
  ];

  return (
    <section id="highlights" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-foreground mb-6">
            Discover Excellence
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Every aspect of your stay is crafted to exceed expectations, from our elegant accommodations 
            to extraordinary experiences that showcase the beauty of Namibia.
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((item, index) => (
            <Card key={index} className="luxury-card group cursor-pointer overflow-hidden border-0">
              <div className="image-hover aspect-[4/3] relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-secondary/20 group-hover:bg-secondary/40 transition-all duration-500" />
                <div className="absolute top-4 left-4 p-3 bg-primary/90 rounded-full">
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-playfair font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {item.description}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full btn-luxury group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                >
                  {item.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-accent/50 px-8 py-6 rounded-2xl">
            <div>
              <p className="text-lg font-medium text-foreground">Ready to experience luxury?</p>
              <p className="text-muted-foreground">Book your stay today and create unforgettable memories.</p>
            </div>
            <Button size="lg" className="btn-luxury bg-primary hover:bg-primary/90 text-primary-foreground">
              Reserve Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Highlights;