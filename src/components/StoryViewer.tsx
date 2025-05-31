
import { useState } from "react";
import { ArrowUp, Share, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface StoryViewerProps {
  story: any;
  onBack: () => void;
}

const StoryViewer = ({ story, onBack }: StoryViewerProps) => {
  const [currentSegment, setCurrentSegment] = useState(1);
  const [storyPath, setStoryPath] = useState<number[]>([1]);

  const segment = story.segments.find((s: any) => s.id === currentSegment);

  const handleChoice = (choice: any) => {
    if (choice.nextSegment) {
      setCurrentSegment(choice.nextSegment);
      setStoryPath([...storyPath, choice.nextSegment]);
    }
  };

  const shareStory = () => {
    const text = `I just discovered an amazing story about ${story.location} on StoryScape! #StoryScape #BoltHackathon`;
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.href);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          onClick={onBack}
          variant="outline" 
          className="glass-card border-mystical-accent/30"
        >
          <ArrowUp className="w-4 h-4 mr-2" />
          Back to Search
        </Button>
        <Button 
          onClick={shareStory}
          className="mystical-button"
        >
          <Share className="w-4 h-4 mr-2" />
          Share Story
        </Button>
      </div>

      <Card className="story-card">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-mystical text-mystical-accent glow-text">
              {story.title}
            </h2>
            <p className="text-mystical-accent/80 text-sm">
              Chapter {storyPath.length} of your adventure
            </p>
          </div>

          {segment && (
            <div className="space-y-6">
              <div className="relative">
                <img 
                  src={segment.image} 
                  alt="Story scene"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-mystical-primary/60 to-transparent rounded-lg"></div>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-white/90 leading-relaxed text-lg">
                  {segment.text}
                </p>
              </div>

              {segment.choices && (
                <div className="space-y-3">
                  <h4 className="text-mystical-accent font-semibold">What do you do?</h4>
                  {segment.choices.map((choice: any) => (
                    <button
                      key={choice.id}
                      onClick={() => handleChoice(choice)}
                      className="decision-button w-full text-left"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-mystical-accent font-bold text-lg">
                          {choice.id}.
                        </span>
                        <span className="text-white flex-1">
                          {choice.text}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card className="glass-card p-6">
        <h3 className="text-mystical-accent font-mystical text-lg mb-4">
          Cultural Insights about {story.location.split(',')[0]}
        </h3>
        <div className="space-y-2">
          {story.culturalInsights.map((insight: string, index: number) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-mystical-accent rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-white/80 text-sm">{insight}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default StoryViewer;
