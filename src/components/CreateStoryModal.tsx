
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateStoryModal = ({ isOpen, onClose }: CreateStoryModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    prompt: "",
    imagePrompt: ""
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = async () => {
    if (!formData.imagePrompt.trim()) {
      toast({
        title: "Image prompt required",
        description: "Please enter a description for the image",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingImage(true);
    try {
      console.log('Calling image generation function...');
      
      const { data, error } = await supabase.functions.invoke('generate-story-image', {
        body: {
          prompt: formData.imagePrompt,
          location: formData.location
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Image generation response:', data);

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast({
          title: "Image generated!",
          description: data.message || "Your story image has been created.",
        });
      } else {
        throw new Error('No image URL received');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      // Use a fallback image
      const fallbackImage = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80`;
      setGeneratedImage(fallbackImage);
      toast({
        title: "Using placeholder image",
        description: "Generated a beautiful placeholder for your story.",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const createStory = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create stories",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title || !formData.location || !formData.prompt) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Create story content
      const storyContent = {
        segments: [
          {
            id: 1,
            text: `${formData.prompt} In the heart of ${formData.location}, an adventure unfolds that will change everything. The ancient streets whisper secrets of the past while modern life bustles around you.`,
            image: generatedImage || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
            choices: [
              { id: 'A', text: "Explore the mysterious alleyways", nextSegment: 2 },
              { id: 'B', text: "Visit the local marketplace", nextSegment: 3 },
              { id: 'C', text: "Seek out the town's historian", nextSegment: 4 }
            ]
          },
          {
            id: 2,
            text: "The narrow alleyways reveal hidden murals and forgotten doorways. Each step takes you deeper into the soul of the city.",
            image: generatedImage || "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&h=300&fit=crop",
            choices: [
              { id: 'A', text: "Follow the murals to their source", nextSegment: 5 },
              { id: 'B', text: "Knock on an ancient door", nextSegment: 6 }
            ]
          }
        ]
      };

      console.log('Creating story with data:', {
        title: formData.title,
        location: formData.location,
        content: storyContent,
        image_urls: [generatedImage || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"]
      });

      // Save story to database
      const { data: storyData, error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          title: formData.title,
          location: formData.location,
          content: storyContent,
          cultural_insights: [
            `${formData.location} has a rich cultural heritage spanning centuries.`,
            "Local traditions are deeply woven into daily life.",
            "The architecture tells stories of different historical periods."
          ],
          image_urls: [generatedImage || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"],
          is_public: true,
          upvotes: 1 // Start with author's implicit upvote
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving story:', error);
        toast({
          title: "Error creating story",
          description: "Failed to save your story. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Story created successfully:', storyData);

      // Create story interaction record
      await supabase
        .from('story_interactions')
        .insert({
          user_id: user.id,
          story_id: storyData.id,
          choices_made: { segment_1: 'A' }
        });

      // Create initial vote (author's implicit upvote)
      await supabase
        .from('story_votes')
        .insert({
          user_id: user.id,
          story_id: storyData.id,
          vote_type: 'upvote'
        });

      toast({
        title: "Story created!",
        description: "Your story has been published to the community.",
      });

      // Reset form and close modal
      setFormData({ title: "", location: "", prompt: "", imagePrompt: "" });
      setGeneratedImage(null);
      onClose();
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: "Creation failed",
        description: "Failed to create story. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Create Your Story
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Story Title</label>
            <Input
              placeholder="Enter your story title..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Location</label>
            <Input
              placeholder="e.g., Paris, France"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Story Prompt</label>
            <Textarea
              placeholder="Describe the beginning of your story..."
              value={formData.prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Image Description (Optional)</label>
            <div className="flex gap-2">
              <Input
                placeholder="Describe the scene for AI image generation..."
                value={formData.imagePrompt}
                onChange={(e) => setFormData(prev => ({ ...prev, imagePrompt: e.target.value }))}
              />
              <Button 
                onClick={generateImage} 
                disabled={isGeneratingImage}
                variant="outline"
              >
                {isGeneratingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Image className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {generatedImage && (
            <div className="mt-4">
              <img
                src={generatedImage}
                alt="Generated story image"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={createStory} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Story
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStoryModal;
