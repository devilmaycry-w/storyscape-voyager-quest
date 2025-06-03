import { useState, useEffect } from "react";
import { Users, ArrowUp, MapPin, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  content: any;
  user_id: string;
  profiles?: {
    username: string;
  } | null;
}

const CommunityStories = ({ isVisible }: CommunityStoriesProps) => {
  const [filter, setFilter] = useState('popular');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['stories', filter],
    queryFn: async () => {
      let query = supabase
        .from('stories')
        .select(`
          *,
          profiles(username)
        `)
        .eq('is_public', true);

      // Apply different sorting based on filter
      switch (filter) {
        case 'popular':
          query = query.order('upvotes', { ascending: false });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'trending':
          // For trending, we'll use a combination of recent creation and upvotes
          query = query
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('upvotes', { ascending: false });
          break;
      }

      const { data, error } = await query.limit(9);
      if (error) throw error;
      
      // Transform the data to match our Story interface
      return (data || []).map(item => ({
        ...item,
        profiles: item.profiles && typeof item.profiles === 'object' && 'username' in item.profiles 
          ? { username: item.profiles.username }
          : null
      })) as Story[];
    }
  });

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
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('story_votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('story_id', storyId)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === 'upvote') {
          // Remove upvote
          await supabase
            .from('story_votes')
            .delete()
            .eq('id', existingVote.id);
          
          await supabase.rpc('decrement_upvotes', { story_id: storyId });
        } else {
          // Change downvote to upvote
          await supabase
            .from('story_votes')
            .update({ vote_type: 'upvote' })
            .eq('id', existingVote.id);
            
          await supabase.rpc('increment_upvotes', { story_id: storyId });
        }
      } else {
        // Add new upvote
        await supabase
          .from('story_votes')
          .insert({
            user_id: user.id,
            story_id: storyId,
            vote_type: 'upvote'
          });
          
        await supabase.rpc('increment_upvotes', { story_id: storyId });
      }

      // Refresh the stories data
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

  const handleRead = async (story: Story) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to read stories",
        variant: "destructive"
      });
      return;
    }

    try {
      // Record story interaction
      await supabase
        .from('story_interactions')
        .insert({
          user_id: user.id,
          story_id: story.id,
          choices_made: {}
        });

      toast({
        title: "Story opened!",
        description: `Now reading "${story.title}"`,
      });
    } catch (error) {
      console.error('Error recording read:', error);
    }
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Card key={story.id} className="story-card overflow-hidden cursor-pointer group">
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
                  {typeof story.content === 'object' && story.content?.segments?.[0]?.text 
                    ? story.content.segments[0].text 
                    : "An enchanting story awaits..."}
                </p>
                
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-mystical-accent" />
                    <span className="text-white/70 text-sm">
                      by {story.profiles?.username || 'Anonymous'}
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
