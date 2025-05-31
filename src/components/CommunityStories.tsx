
import { useState } from "react";
import { Users, ArrowUp, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CommunityStoriesProps {
  isVisible: boolean;
}

const CommunityStories = ({ isVisible }: CommunityStoriesProps) => {
  const [filter, setFilter] = useState('popular');

  const communityStories = [
    {
      id: 1,
      title: "The Phantom of Montmartre",
      location: "Paris, France",
      author: "Emma_Writer",
      upvotes: 42,
      thumbnail: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=300&h=200&fit=crop",
      preview: "A mysterious figure haunts the cobblestone streets of Montmartre, leaving behind only whispers and golden coins..."
    },
    {
      id: 2,
      title: "Secrets of the Floating Market",
      location: "Bangkok, Thailand",
      author: "AdventureSeeker",
      upvotes: 38,
      thumbnail: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=300&h=200&fit=crop",
      preview: "Ancient spirits guide travelers through the magical waterways where reality bends like the river itself..."
    },
    {
      id: 3,
      title: "The Clockmaker's Dream",
      location: "Prague, Czech Republic", 
      author: "TimeTraveler_93",
      upvotes: 35,
      thumbnail: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300&h=200&fit=crop",
      preview: "In the heart of the old city, a magical clock doesn't just tell time—it reveals the future..."
    }
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communityStories.map((story) => (
          <Card key={story.id} className="story-card overflow-hidden cursor-pointer group">
            <div className="relative">
              <img 
                src={story.thumbnail} 
                alt={story.title}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-mystical-primary to-transparent opacity-60"></div>
              <div className="absolute top-3 right-3 glass-card px-2 py-1 flex items-center space-x-1">
                <ArrowUp className="w-3 h-3 text-mystical-accent" />
                <span className="text-mystical-accent text-sm font-semibold">
                  {story.upvotes}
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
                {story.preview}
              </p>
              
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-mystical-accent" />
                  <span className="text-white/70 text-sm">
                    by {story.author}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="text-mystical-accent hover:bg-mystical-accent/10"
                >
                  Read
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" className="glass-card border-mystical-accent/30">
          Load More Stories
        </Button>
      </div>
    </div>
  );
};

export default CommunityStories;
