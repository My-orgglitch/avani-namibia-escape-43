import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Activity {
  id: string;
  name: string;
  description: string;
  duration: string;
  max_group_size: number;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  price_nad: number;
  highlights: string[];
  images: string[];
  is_featured: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export const useActivities = () => {
  return useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('is_available', true)
        .order('is_featured', { ascending: false });
      
      if (error) throw error;
      return data as Activity[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActivity = (id: string) => {
  return useQuery({
    queryKey: ['activity', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Activity;
    },
    enabled: !!id,
  });
};

export const useActivityWithRating = (id: string) => {
  return useQuery({
    queryKey: ['activity-with-rating', id],
    queryFn: async () => {
      const [activityResponse, ratingResponse] = await Promise.all([
        supabase.from('activities').select('*').eq('id', id).single(),
        supabase.rpc('get_activity_average_rating', { activity_uuid: id })
      ]);
      
      if (activityResponse.error) throw activityResponse.error;
      
      return {
        ...activityResponse.data as Activity,
        average_rating: ratingResponse.data || 0
      };
    },
    enabled: !!id,
  });
};