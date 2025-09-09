import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CreditCard, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingType: 'room' | 'activity';
  itemId: string;
  itemName: string;
  priceNad: number;
}

const formatCurrency = (cents: number) => {
  return `N$${(cents / 100).toFixed(2)}`;
};

export const BookingModal = ({ 
  isOpen, 
  onClose, 
  bookingType, 
  itemId, 
  itemName, 
  priceNad 
}: BookingModalProps) => {
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    number_of_guests: 1,
    special_requests: '',
    check_in_date: undefined as Date | undefined,
    check_out_date: undefined as Date | undefined,
    activity_date: undefined as Date | undefined,
    payment_method: 'online' as 'online' | 'arrival',
  });
  const [isLoading, setIsLoading] = useState(false);

  const calculateTotal = () => {
    if (bookingType === 'room' && formData.check_in_date && formData.check_out_date) {
      const nights = Math.ceil(
        (formData.check_out_date.getTime() - formData.check_in_date.getTime()) / (1000 * 60 * 60 * 24)
      );
      return priceNad * nights;
    }
    if (bookingType === 'activity') {
      return priceNad * formData.number_of_guests;
    }
    return priceNad;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create booking
      const { data: bookingData, error: bookingError } = await supabase.functions.invoke('create-booking', {
        body: {
          booking_type: bookingType,
          [bookingType === 'room' ? 'room_id' : 'activity_id']: itemId,
          ...formData,
          check_in_date: formData.check_in_date?.toISOString().split('T')[0],
          check_out_date: formData.check_out_date?.toISOString().split('T')[0],
          activity_date: formData.activity_date?.toISOString().split('T')[0],
          payment_on_arrival: formData.payment_method === 'arrival',
        }
      });

      if (bookingError) throw bookingError;

      if (formData.payment_method === 'arrival') {
        toast.success('Booking confirmed! You can pay on arrival. Confirmation email sent.');
        resetAndClose();
      } else {
        // Create payment intent and redirect to Stripe
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment', {
          body: {
            booking_id: bookingData.booking_id,
            amount_nad: calculateTotal() * 100, // Convert to cents
            currency: 'NAD',
            description: `${bookingType === 'room' ? 'Room' : 'Activity'} booking: ${itemName}`
          }
        });

        if (paymentError) throw paymentError;

        // Open Stripe checkout in a new tab
        window.open(paymentData.url, '_blank');
        toast.success('Booking created! Complete payment in the new tab.');
        resetAndClose();
      }
      
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setFormData({
      guest_name: '',
      guest_email: '',
      guest_phone: '',
      number_of_guests: 1,
      special_requests: '',
      check_in_date: undefined,
      check_out_date: undefined,
      activity_date: undefined,
      payment_method: 'online',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {itemName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guest_name">Full Name *</Label>
              <Input
                id="guest_name"
                value={formData.guest_name}
                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="guest_email">Email *</Label>
              <Input
                id="guest_email"
                type="email"
                value={formData.guest_email}
                onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guest_phone">Phone</Label>
              <Input
                id="guest_phone"
                value={formData.guest_phone}
                onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="number_of_guests">Guests *</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="number_of_guests"
                  type="number"
                  min="1"
                  max={bookingType === 'room' ? 4 : 10}
                  value={formData.number_of_guests}
                  onChange={(e) => setFormData({ ...formData, number_of_guests: parseInt(e.target.value) })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {bookingType === 'room' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Check-in Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.check_in_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.check_in_date ? format(formData.check_in_date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.check_in_date}
                      onSelect={(date) => setFormData({ ...formData, check_in_date: date })}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Check-out Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.check_out_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.check_out_date ? format(formData.check_out_date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.check_out_date}
                      onSelect={(date) => setFormData({ ...formData, check_out_date: date })}
                      disabled={(date) => date < (formData.check_in_date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ) : (
            <div>
              <Label>Activity Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.activity_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.activity_date ? format(formData.activity_date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.activity_date}
                    onSelect={(date) => setFormData({ ...formData, activity_date: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div>
            <Label htmlFor="special_requests">Special Requests</Label>
            <Textarea
              id="special_requests"
              value={formData.special_requests}
              onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
              placeholder="Any special requests or requirements..."
              rows={3}
            />
          </div>

          <div>
            <Label>Payment Method</Label>
            <RadioGroup
              value={formData.payment_method}
              onValueChange={(value) => setFormData({ ...formData, payment_method: value as 'online' | 'arrival' })}
              className="flex space-x-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online">Pay Online Now</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="arrival" id="arrival" />
                <Label htmlFor="arrival">Pay on Arrival</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="bg-accent/30 p-4 rounded-lg">
            <div className="flex justify-between items-center font-semibold">
              <span>Total Amount:</span>
              <span className="text-lg text-primary">{formatCurrency(calculateTotal())}</span>
            </div>
            {formData.payment_method === 'arrival' && (
              <p className="text-sm text-muted-foreground mt-1">
                Payment will be collected upon arrival
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full btn-luxury bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Booking...' : 
             formData.payment_method === 'arrival' ? 'Confirm Booking' : 'Continue to Payment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};