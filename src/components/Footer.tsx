import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin, Clock, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 gold-accent rounded-full flex items-center justify-center">
                <span className="text-secondary font-playfair font-bold text-xl">N</span>
              </div>
              <div>
                <h3 className="text-xl font-playfair font-bold">Beaufort Guesthouse</h3>
                <p className="text-xs text-secondary-foreground/70">Luxury Guesthouse</p>
              </div>
            </div>
            <p className="text-secondary-foreground/80 leading-relaxed mb-6">
              Experience unparalleled luxury and authentic African hospitality in the heart of Northern Namibia. 
              Your gateway to extraordinary adventures and unforgettable memories.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Instagram className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-playfair font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/rooms" className="text-secondary-foreground/80 hover:text-primary transition-colors">Rooms & Suites</Link></li>
              <li><Link to="/dining" className="text-secondary-foreground/80 hover:text-primary transition-colors">Dining</Link></li>
              <li><Link to="/activities" className="text-secondary-foreground/80 hover:text-primary transition-colors">Activities</Link></li>
              <li><Link to="/gallery" className="text-secondary-foreground/80 hover:text-primary transition-colors">Gallery</Link></li>
              <li><Link to="/about" className="text-secondary-foreground/80 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-secondary-foreground/80 hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-playfair font-semibold mb-6">Services</h4>
            <ul className="space-y-3">
              <li className="text-secondary-foreground/80">Safari Tours</li>
              <li className="text-secondary-foreground/80">Cultural Experiences</li>
              <li className="text-secondary-foreground/80">Spa & Wellness</li>
              <li className="text-secondary-foreground/80">Conference Facilities</li>
              <li className="text-secondary-foreground/80">Airport Transfers</li>
              <li className="text-secondary-foreground/80">24/7 Concierge</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-playfair font-semibold mb-6">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-secondary-foreground/80">
                    1234 Safari Avenue<br />
                    Windhoek, Namibia
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-secondary-foreground/80">+264 66 267 800</p>
              </div>
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-secondary-foreground/80">+264 81 233 391 5</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-secondary-foreground/80">beautfortguests@gmail.com</p>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-secondary-foreground/80">
                    Check-in: 2:00 PM<br />
                    Check-out: 11:00 AM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-secondary-foreground/20 py-8">
          <div className="text-center">
            <h4 className="text-lg font-playfair font-semibold mb-4">Stay Connected</h4>
            <p className="text-secondary-foreground/80 mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive offers, travel tips, and updates about new experiences at Beaufort Guesthouse.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-secondary-foreground/10 border border-secondary-foreground/20 text-secondary-foreground placeholder-secondary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="btn-luxury bg-primary hover:bg-primary/90 text-primary-foreground px-6">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-foreground/20 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-secondary-foreground/60">
            <p>© {currentYear} Beaufort Guesthouse. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;