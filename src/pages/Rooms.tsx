import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Wifi, Car, Coffee, Bath, Tv } from 'lucide-react';
import suiteImage from '@/assets/suite-room.jpg';
import { useRooms } from '@/hooks/useRooms';
import { RatingDisplay } from '@/components/RatingDisplay';
import { BookingModal } from '@/components/BookingModal';

const Rooms = () => {
  const { data: rooms, isLoading, error } = useRooms();
  const [selectedRoom, setSelectedRoom] = useState<{id: string; name: string; price: number} | null>(null);

  const formatPrice = (cents: number) => {
    return `From N$${(cents / 100).toFixed(0)}/night`;
  };

  const commonAmenities = [
    { icon: Wifi, name: 'Free Wi-Fi' },
    { icon: Car, name: 'Parking' },
    { icon: Coffee, name: 'Room Service' },
    { icon: Bath, name: 'Luxury Bath' },
    { icon: Tv, name: 'Smart TV' },
    { icon: Users, name: 'Concierge' }
  ];

  return (
    <div className="pt-20 min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-playfair font-bold text-foreground mb-6">
            Rooms & Suites
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Each accommodation is thoughtfully designed to provide exceptional comfort and authentic Namibian hospitality, 
            ensuring your stay is nothing short of extraordinary.
          </p>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center">
              <div className="text-xl text-muted-foreground">Loading rooms...</div>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="text-xl text-destructive">Error loading rooms</div>
            </div>
          ) : (
            <div className="space-y-12">
              {rooms?.map((room) => (
                <Card key={room.id} className="luxury-card overflow-hidden border-0">
                  <div className="grid lg:grid-cols-2 gap-0">
                    {/* Image */}
                    <div className="image-hover aspect-[4/3] lg:aspect-auto relative">
                      <img
                        src={room.images?.[0] || suiteImage}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                      {room.is_featured && (
                        <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                          Most Popular
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <CardContent className="p-8 lg:p-12 flex flex-col justify-center">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl lg:text-3xl font-playfair font-bold text-foreground mb-2">
                            {room.name}
                          </h3>
                          <RatingDisplay type="room" itemId={room.id} />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-playfair font-bold text-primary">
                            {formatPrice(room.price_nad)}
                          </div>
                          <div className="text-sm text-muted-foreground">{room.capacity} guests</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mb-6 text-sm text-muted-foreground">
                        <span>{room.size_sqm} sqm</span>
                        <span>•</span>
                        <span>{room.capacity} guests</span>
                      </div>

                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {room.description}
                      </p>

                      {/* Amenities */}
                      <div className="mb-8">
                        <h4 className="font-semibold text-foreground mb-3">Room Amenities</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {room.amenities.map((amenity, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              <span>{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          size="lg" 
                          className="btn-luxury bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
                          onClick={() => setSelectedRoom({
                            id: room.id,
                            name: room.name,
                            price: room.price_nad
                          })}
                        >
                          Book This Room
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="btn-luxury flex-1"
                        >
                          View Gallery
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Common Amenities */}
      <section className="py-16 bg-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-playfair font-bold text-foreground mb-4">
              Included in Every Stay
            </h2>
            <p className="text-lg text-muted-foreground">
              Premium amenities and services to enhance your comfort
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {commonAmenities.map((amenity, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <amenity.icon className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-medium text-foreground">{amenity.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="py-16 bg-secondary text-secondary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-playfair font-bold mb-4">
            Ready to Experience Luxury?
          </h2>
          <p className="text-lg text-secondary-foreground/80 mb-8">
            Book your perfect accommodation today and let us create an unforgettable stay for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="btn-luxury bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              Check Availability
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="btn-luxury border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary px-8"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {selectedRoom && (
        <BookingModal
          isOpen={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          bookingType="room"
          itemId={selectedRoom.id}
          itemName={selectedRoom.name}
          priceNad={selectedRoom.price}
        />
      )}
    </div>
  );
};

export default Rooms;