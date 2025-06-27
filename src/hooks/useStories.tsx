
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Story {
  id: string;
  title: string;
  location: string;
  upvotes: number;
  created_at: string;
  image_urls: string[];
  content: {
    segments?: Array<{
      text: string;
    }>;
  };
  user_id: string;
  user_details?: {
    username: string;
  };
  // New fields from schema
  generation_prompt?: string | null;
  ai_generated_story?: boolean;
  story_error_log?: string | null;
  used_fallback_story?: boolean;
}

export const useStories = (filter: string) => {
  return useQuery({
    queryKey: ['stories', filter],
    queryFn: async () => {
      console.log('Fetching stories with filter:', filter);
      
      let query = supabase
        .from('stories')
        .select(`
          id,
          title,
          location,
          upvotes,
          created_at,
          image_urls,
          content,
          user_id,
          used_fallback_story,
          ai_generated_story
        `)
        .eq('is_public', true);

      switch (filter) {
        case 'popular':
          query = query.order('upvotes', { ascending: false });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'trending':
          query = query
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('upvotes', { ascending: false });
          break;
      }

      const { data, error } = await query.limit(9);
      
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      
      return data as Story[];
    }
  });
};

export type { Story };
