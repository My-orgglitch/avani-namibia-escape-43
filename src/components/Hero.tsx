import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import heroImage from '@/assets/hero-guesthouse.jpg';

const Hero = () => {
  const scrollToHighlights = () => {
    const element = document.getElementById('highlights');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Beaufort Guesthouse - Luxury Guesthouse"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-playfair font-bold text-white mb-6">
            Beaufort Guesthouse
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience luxury hospitality in the heart of Northern Namibia. 
            Where elegant comfort meets authentic African adventure.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="btn-luxury bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
            >
              Book Your Stay
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="btn-luxury border-white text-white hover:bg-white hover:text-secondary px-8 py-6 text-lg"
            >
              Explore Activities
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-white/80">
          <div className="text-center">
            <div className="text-2xl font-playfair font-bold text-primary">25+</div>
            <div className="text-sm">Luxury Rooms</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-playfair font-bold text-primary">4.9★</div>
            <div className="text-sm">Guest Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-playfair font-bold text-primary">24/7</div>
            <div className="text-sm">Concierge</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToHighlights}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 hover:text-white transition-colors animate-bounce"
        aria-label="Scroll to content"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </section>
  );
};

export default Hero;