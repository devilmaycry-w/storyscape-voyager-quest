import { useState } from "react";
import { Share, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface StoryViewerProps {
  story: any;
  onBack: () => void;
}

// Add your random stock images and random picker
const randomImages = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1533055640609-24b498cdfd4f?w=400&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=300&fit=crop&q=80",
];

function getRandomImage() {
  const randomIndex = Math.floor(Math.random() * randomImages.length);
  return randomImages[randomIndex];
}

const StoryViewer = ({ story, onBack }: StoryViewerProps) => {
  const [currentSegment, setCurrentSegment] = useState(1);
  const [storyPath, setStoryPath] = useState<number[]>([1]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showFullStory, setShowFullStory] = useState(false);
  const { toast } = useToast();

  const segment = story.segments.find((s: any) => s.id === currentSegment);

  const handleChoice = async (choice: any) => {
    if (choice.nextSegment && !isTransitioning) {
      setIsTransitioning(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentSegment(choice.nextSegment);
      setStoryPath([...storyPath, choice.nextSegment]);
      setIsTransitioning(false);
    }
  };

  const shareStory = async () => {
    const text = `I just discovered an amazing story about ${story.location} on StoryScape! #StoryScape`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: story.title,
          text: text,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(text + ' ' + window.location.href);
        toast({
          title: "Link copied",
          description: "Story link has been copied to your clipboard!",
        });
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(text + ' ' + window.location.href);
        toast({
          title: "Link copied",
          description: "Story link has been copied to your clipboard!",
        });
      } catch (clipboardError) {
        toast({
          title: "Share failed",
          description: "Unable to share or copy the story link.",
          variant: "destructive"
        });
      }
    }
  };

  // Use a stable random image per segment index for full story view for consistency
  const getSegmentFallbackImage = (index: number) =>
    randomImages[index % randomImages.length];

  const renderFullStory = () => {
    return (
      <div className="space-y-8">
        {story.segments.map((segment: any, index: number) => (
          <Card key={index} className="story-card overflow-hidden">
            <div className="space-y-6">
              <div className="relative">
                <img 
                  src={segment.image || getSegmentFallbackImage(index)} 
                  alt={`Scene ${index + 1}`}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-mystical-primary/80 to-transparent rounded-lg"></div>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-white/90 leading-relaxed text-lg md:text-xl">
                  {segment.text}
                </p>
              </div>

              {segment.choices && (
                <div className="space-y-3">
                  <h4 className="text-mystical-accent font-semibold text-lg">Possible Paths:</h4>
                  <div className="grid gap-3">
                    {segment.choices.map((choice: any) => (
                      <div key={choice.id} className="decision-button opacity-50">
                        <div className="flex items-start space-x-3">
                          <span className="text-mystical-accent font-bold text-lg">
                            {choice.id}.
                          </span>
                          <span className="text-white flex-1">
                            {choice.text}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <Button 
          onClick={onBack}
          variant="outline" 
          className="glass-card border-mystical-accent/30"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowFullStory(!showFullStory)}
            variant="outline"
            className="glass-card border-mystical-accent/30"
          >
            {showFullStory ? "Interactive Mode" : "Read Full Story"}
          </Button>
          <Button 
            onClick={shareStory}
            className="mystical-button"
          >
            <Share className="w-4 h-4 mr-2" />
            Share Story
          </Button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-mystical text-mystical-accent glow-text">
          {story.title}
        </h2>
        <div className="flex items-center justify-center space-x-2 text-mystical-accent/80 text-sm">
          <span>{showFullStory ? "Full Story View" : `Chapter ${storyPath.length}`}</span>
          <span>•</span>
          <span>{story.location}</span>
        </div>
      </div>

      {showFullStory ? (
        renderFullStory()
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSegment}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="story-card overflow-hidden">
              <div className="space-y-6">
                {segment && (
                  <div className="space-y-6">
                    <div className="relative">
                      {/* Use a random image if segment.image is missing */}
                      <img 
                        src={segment.image || getRandomImage()} 
                        alt="Story scene"
                        className="w-full h-64 md:h-96 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-mystical-primary/80 to-transparent rounded-lg"></div>
                    </div>

                    <div className="prose prose-invert max-w-none">
                      <p className="text-white/90 leading-relaxed text-lg md:text-xl">
                        {segment.text}
                      </p>
                    </div>

                    {segment.choices && (
                      <div className="space-y-3">
                        <h4 className="text-mystical-accent font-semibold text-lg">What will you do?</h4>
                        <div className="grid gap-3">
                          {segment.choices.map((choice: any) => (
                            <motion.button
                              key={choice.id}
                              onClick={() => handleChoice(choice)}
                              className="decision-button w-full text-left"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-start space-x-3">
                                <span className="text-mystical-accent font-bold text-lg">
                                  {choice.id}.
                                </span>
                                <span className="text-white flex-1">
                                  {choice.text}
                                </span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      <Card className="glass-card p-6">
        <h3 className="text-mystical-accent font-mystical text-lg mb-4">
          Cultural Insights about {story.location.split(',')[0]}
        </h3>
        <div className="space-y-2">
          {story.culturalInsights.map((insight: string, index: number) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-mystical-accent rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-white/80 text-sm">
                {insight}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default StoryViewer;
