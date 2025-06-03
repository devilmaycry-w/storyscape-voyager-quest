import { useState, useEffect } from "react";
import { Users, ArrowUp, MapPin, Eye, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface CommunityStoriesProps {
  isVisible: boolean;
}

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
}

const CommunityStories = ({ isVisible }: CommunityStoriesProps) => {
  const [filter, setFilter] = useState('popular');
  const [flippedStoryId, setFlippedStoryId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stories = [], isLoading, error } = useQuery({
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
          user_id
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

  useEffect(() => {
    if (error) {
      console.error('Query error:', error);
      toast({
        title: "Error loading stories",
        description: "Failed to load community stories. Please try again.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const handleUpvote = async (storyId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote on stories",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: existingVote } = await supabase
        .from('story_votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('story_id', storyId)
        .maybeSingle();

      if (existingVote) {
        if (existingVote.vote_type === 'upvote') {
          await supabase
            .from('story_votes')
            .delete()
            .eq('id', existingVote.id);
          
          await supabase.rpc('decrement_upvotes', { story_id: storyId });
        } else {
          await supabase
            .from('story_votes')
            .update({ vote_type: 'upvote' })
            .eq('id', existingVote.id);
            
          await supabase.rpc('increment_upvotes', { story_id: storyId });
        }
      } else {
        await supabase
          .from('story_votes')
          .insert({
            user_id: user.id,
            story_id: storyId,
            vote_type: 'upvote'
          });
          
        await supabase.rpc('increment_upvotes', { story_id: storyId });
      }

      queryClient.invalidateQueries({ queryKey: ['stories'] });
      
      toast({
        title: "Vote recorded!",
        description: "Thank you for your feedback.",
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Vote failed",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRead = (story: Story) => {
    setFlippedStoryId(flippedStoryId === story.id ? null : story.id);
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-mystical text-mystical-accent glow-text">
          Community Stories
        </h2>
        <p className="text-white/80">
          Discover amazing tales crafted by fellow storytellers
        </p>
      </div>

      <div className="flex justify-center space-x-2">
        {['popular', 'recent', 'trending'].map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(filterType)}
            className={filter === filterType ? "mystical-button" : "glass-card border-mystical-accent/30"}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-mystical-accent border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-white/70">Loading stories...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-400">Error loading stories. Please try again.</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['stories'] })}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/70">No stories found. Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div key={story.id} className="relative perspective-1000">
              <motion.div
                initial={false}
                animate={{ rotateY: flippedStoryId === story.id ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                className="w-full preserve-3d"
              >
                {/* Front of card */}
                <Card className={`story-card overflow-hidden ${flippedStoryId === story.id ? 'backface-hidden' : ''}`}>
                  <div className="relative">
                    <img 
                      src={story.image_urls?.[0] || "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=300&h=200&fit=crop"} 
                      alt={story.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-mystical-primary to-transparent opacity-60"></div>
                    <div className="absolute top-3 right-3 glass-card px-2 py-1 flex items-center space-x-1">
                      <ArrowUp className="w-3 h-3 text-mystical-accent" />
                      <span className="text-mystical-accent text-sm font-semibold">
                        {story.upvotes || 0}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-mystical text-lg text-mystical-accent line-clamp-1">
                        {story.title}
                      </h3>
                      <div className="flex items-center space-x-1 text-white/60 text-sm">
                        <MapPin className="w-3 h-3" />
                        <span>{story.location}</span>
                      </div>
                    </div>
                    
                    <p className="text-white/80 text-sm line-clamp-2">
                      {story.content?.segments?.[0]?.text || "An enchanting story awaits..."}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-mystical-accent" />
                        <span className="text-white/70 text-sm">
                          Anonymous
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleUpvote(story.id)}
                          className="text-mystical-accent hover:bg-mystical-accent/10 p-1"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleRead(story)}
                          className="text-mystical-accent hover:bg-mystical-accent/10"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Read
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Back of card */}
                <Card 
                  className={`story-card overflow-hidden absolute inset-0 ${flippedStoryId === story.id ? 'rotate-y-180' : 'backface-hidden'}`}
                >
                  <div className="p-6 h-full flex flex-col">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFlippedStoryId(null)}
                      className="absolute top-2 right-2 text-mystical-accent hover:bg-mystical-accent/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <h3 className="font-mystical text-xl text-mystical-accent mb-4">
                      {story.title}
                    </h3>
                    <div className="flex-1 overflow-y-auto prose prose-invert max-w-none">
                      {story.content?.segments?.map((segment, index) => (
                        <p key={index} className="text-white/90 mb-4">
                          {segment.text}
                        </p>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center">
        <Button variant="outline" className="glass-card border-mystical-accent/30">
          Load More Stories
        </Button>
      </div>
    </div>
  );
};

export default CommunityStories;