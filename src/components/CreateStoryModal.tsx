import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "./ImageUpload";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateStoryModal = ({ isOpen, onClose }: CreateStoryModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    prompt: "",
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `story-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('story-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('story-images')
      .getPublicUrl(filePath);

    return publicUrl;
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

    if (!formData.title || !formData.location || !formData.prompt || !selectedFile) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and upload an image",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Upload the image
      const imageUrl = await uploadImage(selectedFile);

      // Create story content
      const storyContent = {
        segments: [
          {
            id: 1,
            text: `${formData.prompt} In the heart of ${formData.location}, an adventure unfolds that will change everything. The ancient streets whisper secrets of the past while modern life bustles around you.`,
            image: imageUrl,
            choices: [
              { id: 'A', text: "Explore the mysterious alleyways", nextSegment: 2 },
              { id: 'B', text: "Visit the local marketplace", nextSegment: 3 },
              { id: 'C', text: "Seek out the town's historian", nextSegment: 4 }
            ]
          },
          {
            id: 2,
            text: "The narrow alleyways reveal hidden murals and forgotten doorways. Each step takes you deeper into the soul of the city.",
            image: imageUrl,
            choices: [
              { id: 'A', text: "Follow the murals to their source", nextSegment: 5 },
              { id: 'B', text: "Knock on an ancient door", nextSegment: 6 }
            ]
          }
        ]
      };

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
          image_urls: [imageUrl],
          is_public: true,
          upvotes: 1
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create story interaction record
      await supabase
        .from('story_interactions')
        .insert({
          user_id: user.id,
          story_id: storyData.id,
          choices_made: { segment_1: 'A' }
        });

      // Create initial vote
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
      setFormData({ title: "", location: "", prompt: "" });
      setSelectedImage(null);
      setSelectedFile(null);
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
            <label className="text-sm font-medium">Story Image</label>
            <ImageUpload
              onImageSelect={handleImageSelect}
              selectedImage={selectedImage}
            />
          </div>
          
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