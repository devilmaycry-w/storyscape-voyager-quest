import { useState } from "react";
import { ArrowUp, Share, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import AudioPlayer from "./AudioPlayer";
import { useAudio } from "@/hooks/useAudio";

interface StoryViewerProps {
  story: any;
  onBack: () => void;
}

const StoryViewer = ({ story, onBack }: StoryViewerProps) => {
  const [currentSegment, setCurrentSegment] = useState(1);
  const [storyPath, setStoryPath] = useState<number[]>([1]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showFullStory, setShowFullStory] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { generateAudio, isGenerating } = useAudio();

  const segment = story.segments.find((s: any) => s.id === currentSegment);

  const handleGenerateAudio = async () => {
    if (!segment?.text) return;
    
    try {
      const url = await generateAudio(segment.text, story.voice_id || "default");
      setAudioUrl(url);
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: "Audio generation failed",
        description: "Failed to generate audio narration. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleChoice = async (choice: any) => {
    if (choice.nextSegment && !isTransitioning) {
      setIsTransitioning(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for exit animation
      setCurrentSegment(choice.nextSegment);
      setStoryPath([...storyPath, choice.nextSegment]);
      setIsTransitioning(false);
    }
  };

  const shareStory = () => {
    const text = `I just discovered an amazing story about ${story.location} on StoryScape! #StoryScape`;
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

  const renderFullStory = () => {
    return (
      <div className="space-y-8">
        {story.segments.map((segment: any, index: number) => (
          <Card key={index} className="story-card overflow-hidden">
            <div className="space-y-6">
              <div className="relative">
                <img 
                  src={segment.image} 
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
                      <img 
                        src={segment.image} 
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

                    <div className="mt-4">
                      <AudioPlayer
                        audioUrl={audioUrl}
                        title={`Chapter ${storyPath.length}`}
                        isLoading={isGenerating}
                        onEnded={() => setAudioUrl(null)}
                      />
                      {!audioUrl && !isGenerating && (
                        <Button
                          onClick={handleGenerateAudio}
                          className="w-full mt-2 mystical-button"
                        >
                          Generate Audio Narration
                        </Button>
                      )}
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