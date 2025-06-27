import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useStories, type Story } from "@/hooks/useStories";
import StoryFilters from "./community/StoryFilters";
import StoriesGrid from "./community/StoriesGrid";

interface CommunityStoriesProps {
  isVisible: boolean;
}

// Web Speech API helper: speak text with an expressive male voice
function speakStoryWithWebSpeech(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    // Try to select a male, expressive English voice
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(
      v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male')
    );
    if (!selectedVoice) {
      selectedVoice =
        voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('david')) ||
        voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('alex')) ||
        voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('english')) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0];
    }
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.pitch = 1; // normal pitch
    utterance.rate = 1;  // normal rate
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Sorry, your browser does not support speech synthesis.');
  }
}

const CommunityStories = ({ isVisible }: CommunityStoriesProps) => {
  const [filter, setFilter] = useState('popular');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: stories = [], isLoading, error } = useStories(filter);

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

      // Use the most relevant story text for reading aloud:
      const storyText =
        story.content?.segments?.[0]?.text ||
        story.text ||
        story.title ||
        "No story text available.";

      speakStoryWithWebSpeech(storyText);

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

      <StoryFilters filter={filter} onFilterChange={setFilter} />

      <StoriesGrid 
        stories={stories}
        isLoading={isLoading}
        error={error}
        onUpvote={handleUpvote}
        onRead={handleRead}
      />

      <div className="text-center">
        <Button variant="outline" className="glass-card border-mystical-accent/30">
          Load More Stories
        </Button>
      </div>
    </div>
  );
};

export default CommunityStories;
