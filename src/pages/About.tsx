import { Card, CardContent } from '@/components/ui/card';
import heroImage from '@/assets/hero-guesthouse.jpg';

const About = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">About Our Guesthouse</h1>
          <p className="text-xl md:text-2xl">Where comfort meets African hospitality</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-primary">Our Story</h2>
            <p className="text-lg text-muted-foreground mb-4">
              Nestled in the heart of Namibia, our guesthouse has been providing exceptional hospitality 
              for over two decades. We began as a small family business with a simple mission: to offer 
              travelers a home away from home while showcasing the natural beauty of our beloved country.
            </p>
            <p className="text-lg text-muted-foreground mb-4">
              What started as a modest accommodation has grown into a premier destination that seamlessly 
              blends modern comfort with authentic Namibian culture. Every corner of our property tells 
              a story of dedication, passion, and our commitment to sustainable tourism.
            </p>
          </div>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <img 
                src={heroImage} 
                alt="Our guesthouse exterior" 
                className="w-full h-64 object-cover"
              />
            </CardContent>
          </Card>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌿</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Sustainability</h3>
              <p className="text-muted-foreground">
                We're committed to eco-friendly practices that preserve Namibia's pristine environment 
                for future generations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Hospitality</h3>
              <p className="text-muted-foreground">
                Our warm, personalized service ensures every guest feels welcomed and valued throughout 
                their stay with us.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Local Culture</h3>
              <p className="text-muted-foreground">
                We celebrate and share Namibian heritage through authentic experiences and 
                partnerships with local communities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mission Section */}
        <Card className="bg-primary/5">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-primary">Our Mission</h2>
            <p className="text-lg text-center text-muted-foreground max-w-4xl mx-auto">
              To provide exceptional accommodation and unforgettable experiences that connect our guests 
              with the soul of Namibia. We strive to be more than just a place to stay – we're your 
              gateway to discovering the magic of African landscapes, wildlife, and culture while 
              contributing positively to our local community and environment.
            </p>
          </CardContent>
        </Card>

        {/* Team Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-primary">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">MK</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Maria Kapembe</h3>
                <p className="text-primary font-medium mb-2">General Manager</p>
                <p className="text-sm text-muted-foreground">
                  With 15 years in hospitality, Maria ensures every guest receives personalized care.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-secondary to-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">JN</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Johannes Nakale</h3>
                <p className="text-primary font-medium mb-2">Safari Guide</p>
                <p className="text-sm text-muted-foreground">
                  A local expert who brings Namibia's wildlife and landscapes to life for our guests.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-accent to-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">LH</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Linda Hansen</h3>
                <p className="text-primary font-medium mb-2">Head Chef</p>
                <p className="text-sm text-muted-foreground">
                  Creates culinary masterpieces blending international cuisine with local flavors.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;