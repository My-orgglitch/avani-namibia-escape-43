import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  size_sqm: number;
  price_nad: number;
  amenities: string[];
  images: string[];
  is_featured: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_available', true)
        .order('is_featured', { ascending: false });
      
      if (error) throw error;
      return data as Room[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRoom = (id: string) => {
  return useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Room;
    },
    enabled: !!id,
  });
};

export const useRoomWithRating = (id: string) => {
  return useQuery({
    queryKey: ['room-with-rating', id],
    queryFn: async () => {
      const [roomResponse, ratingResponse] = await Promise.all([
        supabase.from('rooms').select('*').eq('id', id).single(),
        supabase.rpc('get_room_average_rating', { room_uuid: id })
      ]);
      
      if (roomResponse.error) throw roomResponse.error;
      
      return {
        ...roomResponse.data as Room,
        average_rating: ratingResponse.data || 0
      };
    },
    enabled: !!id,
  });
};