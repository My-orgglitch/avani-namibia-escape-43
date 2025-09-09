import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, MapPin, Phone } from 'lucide-react';
import restaurantImage from '@/assets/restaurant.jpg';

const Dining = () => {
  const [selectedCategory, setSelectedCategory] = useState('appetizers');

  const menuCategories = {
    appetizers: [
      { name: 'Namibian Oysters', description: 'Fresh Walvis Bay oysters with lemon and mignonette', price: 'N$180' },
      { name: 'Springbok Carpaccio', description: 'Thinly sliced springbok with capers and parmesan', price: 'N$155' },
      { name: 'Kudu Biltong Platter', description: 'Selection of local biltong with artisanal crackers', price: 'N$145' },
      { name: 'Wild Mushroom Soup', description: 'Creamy Kalahari truffle and wild mushroom soup', price: 'N$95' },
    ],
    mains: [
      { name: 'Grilled Oryx Fillet', description: 'Tender oryx with rosemary jus and seasonal vegetables', price: 'N$385' },
      { name: 'Swakopmund Rock Lobster', description: 'Grilled lobster tail with garlic butter and rice', price: 'N$450' },
      { name: 'Braai Platter for Two', description: 'Mixed grill with boerewors, lamb chops, and chicken', price: 'N$520' },
      { name: 'Vegetarian Bobotie', description: 'Traditional spiced dish with lentils and dried fruit', price: 'N$185' },
      { name: 'Pan-Seared Kingklip', description: 'Fresh line fish with lemon butter and herb crust', price: 'N$295' },
      { name: 'Ostrich Medallions', description: 'Lean ostrich with pepper sauce and roasted potatoes', price: 'N$265' },
    ],
    desserts: [
      { name: 'Malva Pudding', description: 'Traditional warm sponge with custard and cream', price: 'N$85' },
      { name: 'Amarula Cheesecake', description: 'Rich cheesecake with local Amarula liqueur', price: 'N$95' },
      { name: 'Kalahari Melon Sorbet', description: 'Refreshing sorbet made from desert melons', price: 'N$75' },
      { name: 'Chocolate Baobab Mousse', description: 'Dark chocolate mousse with baobab fruit', price: 'N$105' },
    ],
    beverages: [
      { name: 'Local Wine Selection', description: 'Namibian wines by the glass', price: 'N$65-120' },
      { name: 'Craft Beer Flight', description: 'Taste of 4 local Namibian craft beers', price: 'N$145' },
      { name: 'Fresh Fruit Juices', description: 'Seasonal fresh pressed juices', price: 'N$45' },
      { name: 'Traditional Rooibos Tea', description: 'Organic red bush tea service', price: 'N$35' },
      { name: 'Espresso/Americano', description: 'Premium coffee from local beans', price: 'N$40' },
    ],
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${restaurantImage})`,
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Dining Experience</h1>
          <p className="text-xl md:text-2xl mb-6">
            Authentic Namibian cuisine meets international flavors
          </p>
          <p className="text-lg max-w-2xl mx-auto">
            Savor the tastes of Namibia with fresh local ingredients, traditional recipes, 
            and contemporary culinary techniques in our award-winning restaurant.
          </p>
        </div>
      </section>

      {/* Restaurant Info */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Opening Hours</h3>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Breakfast:</strong> 6:30 AM - 10:00 AM</p>
                <p><strong>Lunch:</strong> 12:00 PM - 3:00 PM</p>
                <p><strong>Dinner:</strong> 6:00 PM - 10:00 PM</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Location</h3>
              <p className="text-muted-foreground">
                Ground Floor<br />
                Main Guesthouse Building<br />
                Terrace seating available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Reservations</h3>
              <p className="text-muted-foreground">
                +264 66 267 8007 / +264 81 233 391 5<br />
                beautfortguests@gmail.com<br />
                <Badge variant="secondary">Advance booking recommended</Badge>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Our Menu</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Experience the flavors of Namibia with our carefully crafted menu featuring local game, 
            fresh seafood, and traditional dishes alongside international favorites.
          </p>
        </div>

        <Tabs defaultValue="appetizers" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="appetizers">Appetizers</TabsTrigger>
            <TabsTrigger value="mains">Main Courses</TabsTrigger>
            <TabsTrigger value="desserts">Desserts</TabsTrigger>
            <TabsTrigger value="beverages">Beverages</TabsTrigger>
          </TabsList>

          <TabsContent value="appetizers">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuCategories.appetizers.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <Badge variant="outline">{item.price}</Badge>
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mains">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuCategories.mains.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <Badge variant="outline">{item.price}</Badge>
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="desserts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuCategories.desserts.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <Badge variant="outline">{item.price}</Badge>
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="beverages">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuCategories.beverages.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <Badge variant="outline">{item.price}</Badge>
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Special Features */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🌱</span>
                Farm-to-Table
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We source ingredients from local farms and sustainable suppliers, 
                ensuring the freshest flavors while supporting our community.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🦌</span>
                Game Specialties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Experience authentic Namibian game meats including oryx, springbok, 
                and ostrich, prepared with traditional and modern techniques.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🍷</span>
                Wine Pairing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our sommelier can recommend perfect wine pairings from our selection 
                of South African and international wines.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default Dining;