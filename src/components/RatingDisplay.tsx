import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RatingDisplayProps {
  type: 'room' | 'activity';
  itemId: string;
  className?: string;
}

interface Rating {
  id: string;
  rating: number;
  review_text: string;
  guest_name: string;
  created_at: string;
}

export const RatingDisplay = ({ type, itemId, className = "" }: RatingDisplayProps) => {
  const { data: ratings, isLoading } = useQuery({
    queryKey: ['ratings', type, itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('rating_type', type)
        .eq(type === 'room' ? 'room_id' : 'activity_id', itemId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Rating[];
    },
  });

  const { data: averageRating } = useQuery({
    queryKey: ['average-rating', type, itemId],
    queryFn: async () => {
      if (type === 'room') {
        const { data, error } = await supabase
          .rpc('get_room_average_rating', { room_uuid: itemId });
        if (error) throw error;
        return data || 0;
      } else {
        const { data, error } = await supabase
          .rpc('get_activity_average_rating', { activity_uuid: itemId });
        if (error) throw error;
        return data || 0;
      }
    },
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'text-primary fill-primary'
            : index < rating
            ? 'text-primary fill-primary/50'
            : 'text-muted-foreground'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <div className="flex space-x-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="w-4 h-4 text-muted-foreground animate-pulse" />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const displayRating = averageRating || 0;
  const reviewCount = ratings?.length || 0;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        <div className="flex">
          {renderStars(displayRating)}
        </div>
        <span className="text-sm font-medium">{displayRating.toFixed(1)}</span>
      </div>
      <span className="text-sm text-muted-foreground">
        ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
};

export const ReviewsList = ({ type, itemId }: { type: 'room' | 'activity'; itemId: string }) => {
  const { data: ratings, isLoading } = useQuery({
    queryKey: ['ratings', type, itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('rating_type', type)
        .eq(type === 'room' ? 'room_id' : 'activity_id', itemId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as Rating[];
    },
  });

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading reviews...</div>;
  }

  if (!ratings || ratings.length === 0) {
    return <div className="text-center text-muted-foreground">No reviews yet.</div>;
  }

  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <div key={rating.id} className="border-b border-border pb-4 last:border-b-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`w-4 h-4 ${
                      index < rating.rating
                        ? 'text-primary fill-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{rating.guest_name}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(rating.created_at).toLocaleDateString()}
            </span>
          </div>
          {rating.review_text && (
            <p className="text-muted-foreground">{rating.review_text}</p>
          )}
        </div>
      ))}
    </div>
  );
};