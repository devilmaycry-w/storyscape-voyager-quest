import { useState } from "react";
import { Loader2, Sparkles, Image, Share, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTokens } from "@/hooks/useTokens";

interface StoryGeneratorProps {
  location: string;
  onStoryGenerated: (story: any) => void;
}

const StoryGenerator = ({ location, onStoryGenerated }: StoryGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { tokenData, canGenerate, tokensUsed, tokensRemaining, refreshTokens } = useTokens();

  const generateStory = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate stories",
        variant: "destructive",
      });
      return;
    }

    if (!canGenerate) {
      toast({
        title: "Token limit exceeded",
        description: "You have reached your daily limit of 5 stories. Please try again after 24 hours.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Calling generate-story function...');
      
      const { data, error } = await supabase.functions.invoke('generate-story', {
        body: {
          location,
          user_id: user.id
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate story');
      }

      if (data.error) {
        if (data.error === 'Token limit exceeded') {
          toast({
            title: "Daily limit reached",
            description: data.message,
            variant: "destructive",
          });
          refreshTokens();
          return;
        } else if (data.error === 'Rate limit exceeded') {
          toast({
            title: "Rate limit exceeded",
            description: "OpenAI API rate limit exceeded. Please try again in a few minutes.",
            variant: "destructive",
          });
          return;
        } else if (data.error === 'API key invalid') {
          toast({
            title: "Configuration error",
            description: "There's an issue with the API configuration. Please contact support.",
            variant: "destructive",
          });
          return;
        } else if (data.error === 'Quota exceeded') {
          toast({
            title: "Service temporarily unavailable",
            description: "The AI service quota has been exceeded. Please contact support.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(data.error);
      }

      console.log('Story generated successfully:', data);
      
      const story = {
        id: data.story.id,
        location,
        title: data.story.title,
        segments: data.story.segments,
        culturalInsights: data.story.culturalInsights
      };
      
      onStoryGenerated(story);
      refreshTokens();
      
      toast({
        title: "Story created!",
        description: `Your magical tale has been woven! ${data.tokens_remaining} stories remaining today.`,
      });

    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateClick = () => {
    if (!canGenerate) {
      toast({
        title: "Token limit exceeded",
        description: "You have reached your daily limit of 5 stories. Please try again after 24 hours.",
        variant: "destructive",
      });
      return;
    }
    generateStory();
  };

  if (isGenerating) {
    return (
      <Card className="story-card text-center py-12">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-mystical-accent animate-spin" />
              <Sparkles className="w-6 h-6 text-mystical-accent absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-sparkle" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-mystical text-mystical-accent">
              Weaving Your Story...
            </h3>
            <p className="text-white/70">
              Gathering the mystical threads of {location}
            </p>
          </div>
          <div className="flex justify-center space-x-4 text-sm text-white/50">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-mystical-accent rounded-full animate-pulse"></div>
              <span>Analyzing location</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-mystical-accent rounded-full animate-pulse delay-300"></div>
              <span>Creating narrative</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-mystical-accent rounded-full animate-pulse delay-700"></div>
              <span>Generating visuals</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="story-card text-center">
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-mystical text-mystical-accent glow-text">
            Discover the Stories of {location.split(',')[0]}
          </h3>
          <p className="text-white/80">
            Let AI weave an enchanting tale based on the rich history and culture of your chosen location
          </p>
        </div>

        {/* Token Status */}
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="w-4 h-4 text-mystical-accent" />
            <span className="text-mystical-accent font-semibold">
              Daily Stories: {tokensUsed}/5
            </span>
          </div>
          <div className="w-full bg-mystical-primary/30 rounded-full h-2">
            <div 
              className="bg-mystical-accent rounded-full h-2 transition-all duration-300"
              style={{ width: `${(tokensUsed / 5) * 100}%` }}
            ></div>
          </div>
          <p className="text-white/60 text-xs">
            {tokensRemaining} stories remaining today
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="glass-card p-4 space-y-2">
            <Sparkles className="w-6 h-6 text-mystical-accent mx-auto" />
            <h4 className="font-semibold text-mystical-accent">Interactive Story</h4>
            <p className="text-white/70">Make choices that shape your adventure</p>
          </div>
          <div className="glass-card p-4 space-y-2">
            <Image className="w-6 h-6 text-mystical-accent mx-auto" />
            <h4 className="font-semibold text-mystical-accent">AI Generated</h4>
            <p className="text-white/70">Unique stories created by artificial intelligence</p>
          </div>
          <div className="glass-card p-4 space-y-2">
            <Share className="w-6 h-6 text-mystical-accent mx-auto" />
            <h4 className="font-semibold text-mystical-accent">Cultural Insights</h4>
            <p className="text-white/70">Learn fascinating facts about the location</p>
          </div>
        </div>

        <Button 
          onClick={handleGenerateClick}
          className={`text-lg px-8 py-3 ${
            canGenerate 
              ? "mystical-button" 
              : "bg-gray-600 text-gray-400 cursor-not-allowed hover:bg-gray-600"
          }`}
          disabled={!canGenerate}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {canGenerate ? "Generate My Story" : "Token Limit Exceeded"}
        </Button>
        
        {!canGenerate && (
          <p className="text-red-400 text-sm">
            Token limit exceeded. Rollback after 24 hrs.
          </p>
        )}
      </div>
    </Card>
  );
};

export default StoryGenerator;
