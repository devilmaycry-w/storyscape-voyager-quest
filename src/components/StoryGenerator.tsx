import { useState } from "react";
import { Loader2, Sparkles, Image, Share } from "lucide-react"; // Removed Clock as it wasn't used
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateText } from "@/integrations/openai/client"; // Import OpenAI client

// Define a more specific type for story data
interface StorySegmentChoice {
  id: string;
  text: string;
  nextSegment: number;
}
interface StorySegment {
  id: number;
  text: string;
  image: string; // Assuming image URLs are still part of the AI response or can be added
  choices: StorySegmentChoice[];
}
interface StoryData {
  title: string;
  segments: StorySegment[];
  culturalInsights: string[];
}

interface StoryGeneratorProps {
  location: string;
  onStoryGenerated: (story: any) => void; // Consider a more specific type for the generated story
}

// Predefined generic story for fallback
const genericFallbackStory: StoryData = {
  title: "A Timeless Adventure",
  segments: [
    {
      id: 1,
      text: "In a place filled with untold stories, your journey begins. The path ahead is unclear, but courage will be your guide.",
      image: "public/placeholder.svg",
      choices: [{ id: 'A', text: "Step into the unknown", nextSegment: 2 }],
    },
    {
      id: 2,
      text: "As you venture forth, the world around you seems to hold its breath, waiting for your next move. What wonders or challenges lie ahead?",
      image: "public/placeholder.svg",
      choices: [], // End of generic story
    },
  ],
  culturalInsights: [
    "Every place has a story, waiting to be discovered.",
    "Adventures can be found in the most unexpected corners of the world.",
  ],
};

const StoryGenerator = ({ location, onStoryGenerated }: StoryGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateStory = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate stories",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    let storyData: StoryData | null = null;
    let generationPrompt: string | null = null;
    let aiGeneratedStory = false;
    let storyErrorLog: string | null = null;
    let usedFallbackStory = false;

    try {
      // 1. Construct prompt for OpenAI
      generationPrompt = `Generate an interactive, branching story about the location: ${location}.
The story should have a compelling title, at least 2 segments, and each segment should have text, an image URL (you can use placeholder like "https://images.unsplash.com/photo-XXXXXXXXX?w=400&h=300&fit=crop&q=80" if unsure), and choices leading to other segments.
Also include 2-3 cultural insights about ${location}.
Return the response as a JSON object with the following structure:
{
  "title": "string",
  "segments": [
    { "id": 1, "text": "string", "image": "url", "choices": [{ "id": "A", "text": "string", "nextSegment": 2 }, ...] },
    { "id": 2, "text": "string", "image": "url", "choices": [...] }
  ],
  "culturalInsights": ["string", "string"]
}
Ensure the JSON is valid.`;

      const aiResponse = await generateText(generationPrompt);

      if (aiResponse) {
        try {
          storyData = JSON.parse(aiResponse) as StoryData;
          // Basic validation of the parsed structure
          if (!storyData.title || !storyData.segments || !storyData.culturalInsights) {
            throw new Error("AI response missing essential fields.");
          }
          storyData.segments.forEach(segment => { // Add placeholder images if missing
            if (!segment.image) segment.image = "public/placeholder.svg";
          });
          aiGeneratedStory = true;
          toast({
            title: "AI Story Generated!",
            description: "The AI has woven a unique tale for you.",
          });
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError);
          storyErrorLog = `Error parsing AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}. Response: ${aiResponse.substring(0, 500)}`;
          // Fallback will be triggered in the outer catch block if storyData remains null
        }
      } else {
        // This case handles if generateText itself returns null (e.g. API key missing)
        storyErrorLog = "AI service returned no response.";
      }

      if (!storyData) throw new Error(storyErrorLog || "AI generation failed.");

    } catch (error) {
      console.error('Error generating story with AI:', error);
      storyErrorLog = storyErrorLog || (error instanceof Error ? error.message : String(error));
      usedFallbackStory = true;

      // Attempt to fetch recent AI-generated story for the same location
      toast({
        title: "AI Generation Failed",
        description: "Attempting to use a fallback story.",
        variant: "default",
      });

      const { data: fallbackDbStory, error: fallbackError } = await supabase
        .from('stories')
        .select('content, cultural_insights, title') // Select necessary fields
        .eq('location', location)
        .eq('ai_generated_story', true) // Ensure it was an AI story
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fallbackDbStory && !fallbackError) {
        // Assuming content in DB matches StoryData structure or can be adapted
        // This might need adjustment based on how 'content' is stored
        const dbContent = fallbackDbStory.content as StoryData;
        storyData = {
            title: fallbackDbStory.title || dbContent.title, // Prefer specific title column if available
            segments: dbContent.segments,
            culturalInsights: fallbackDbStory.cultural_insights || dbContent.culturalInsights,
        };
        toast({
          title: "Using a Recent Story",
          description: `An existing tale for ${location} is being used.`,
        });
      } else {
        // Use predefined generic fallback
        storyData = genericFallbackStory;
        toast({
          title: "Using a Generic Story",
          description: "A general adventure awaits. Please try generating again later for a unique story.",
          variant: "default",
        });
      }
    }

    try {
      // Ensure storyData is not null (it should be set by AI or fallback)
      if (!storyData) {
          // This should ideally not happen if logic is correct
          console.error("Critical error: storyData is null before saving.");
          toast({ title: "Error", description: "Could not prepare story data.", variant: "destructive" });
          setIsGenerating(false);
          return;
      }

      // Save story to database
      const { data: savedStory, error: saveError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          title: storyData.title,
          location: location,
          content: storyData, // The whole story structure
          cultural_insights: storyData.culturalInsights,
          image_urls: storyData.segments.map(s => s.image).filter(img => img !== "public/placeholder.svg"), // Filter out placeholders
          is_public: true,
          generation_prompt: generationPrompt,
          ai_generated_story: aiGeneratedStory,
          story_error_log: storyErrorLog,
          used_fallback_story: usedFallbackStory,
        })
        .select()
        .single();

      if (saveError) {
        // Log detailed error if save fails
        console.error('Error saving story to database:', saveError);
        toast({
          title: "Database Error",
          description: `Failed to save the story: ${saveError.message}`,
          variant: "destructive",
        });
        throw saveError; // Rethrow to be caught by the final catch if needed, or handle differently
      }

      // Pass the fully structured story data to the callback
      onStoryGenerated({
        id: savedStory.id,
        location: location,
        ...storyData
      });

      if (!usedFallbackStory && aiGeneratedStory) {
        // This toast was moved here to ensure it only shows on primary AI success
        // toast({ title: "Story created!", description: "Your magical tale has been woven!" });
      } else if (usedFallbackStory) {
        // Toast for fallback usage is already handled
      }


    } catch (error) { // Catch errors from saving or if storyData was null
      console.error('Final error in story generation/saving process:', error);
      // General error toast if not already handled by specific fallbacks
      if (!usedFallbackStory) { // Avoid double-toasting if fallback was already announced
          toast({
            title: "Generation Failed",
            description: "Failed to create or save story. Please try again.",
            variant: "destructive",
          });
      }
    } finally {
      setIsGenerating(false);
    }
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
              <span>Creating narrative</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-mystical-accent rounded-full animate-pulse delay-300"></div>
              <span>Weaving magic</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-mystical-accent rounded-full animate-pulse delay-700"></div>
              <span>Adding details</span>
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
            Let us weave an enchanting tale based on the rich history and culture of your chosen location
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
            <h4 className="font-semibold text-mystical-accent">Rich Imagery</h4>
            <p className="text-white/70">Beautiful visuals enhance your journey</p>
          </div>
          <div className="glass-card p-4 space-y-2">
            <Share className="w-6 h-6 text-mystical-accent mx-auto" />
            <h4 className="font-semibold text-mystical-accent">Cultural Insights</h4>
            <p className="text-white/70">Learn fascinating facts about the location</p>
          </div>
        </div>

        <Button 
          onClick={generateMockStory}
          className="text-lg px-8 py-3 mystical-button"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Generate My Story
        </Button>
      </div>
    </Card>
  );
};

export default StoryGenerator;