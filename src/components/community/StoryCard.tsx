import { Users, ArrowUp, MapPin, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Story } from "@/hooks/useStories";

interface StoryCardProps {
  story: Story;
  onUpvote: (storyId: string) => void;
  onRead: (story: Story) => void;
  onStop: () => void;
  isReading: boolean;
}

const StoryCard = ({ story, onUpvote, onRead, onStop, isReading }: StoryCardProps) => {
  return (
    <Card className="story-card overflow-hidden cursor-pointer group">
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
              onClick={() => onUpvote(story.id)}
              className="text-mystical-accent hover:bg-mystical-accent/10 p-1"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => isReading ? onStop() : onRead(story)}
              className="text-mystical-accent hover:bg-mystical-accent/10"
            >
              <Eye className="w-4 h-4 mr-1" />
              {isReading ? "Stop" : "Read"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StoryCard;
