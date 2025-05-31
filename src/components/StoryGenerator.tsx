
import { useState } from "react";
import { Loader2, Sparkles, Image, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface StoryGeneratorProps {
  location: string;
  onStoryGenerated: (story: any) => void;
}

const StoryGenerator = ({ location, onStoryGenerated }: StoryGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateStory = async () => {
    setIsGenerating(true);
    
    // Simulate AI story generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const story = {
      id: Date.now(),
      location,
      title: `The Enchanted Tales of ${location.split(',')[0]}`,
      segments: [
        {
          id: 1,
          text: `As twilight descends upon ${location.split(',')[0]}, you find yourself standing before an ancient marketplace. The cobblestones beneath your feet seem to whisper stories of centuries past. A mysterious figure in a hooded cloak approaches you, holding a peculiar glowing artifact.`,
          image: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&h=300&fit=crop",
          choices: [
            { id: 'A', text: "Accept the artifact and follow the figure", nextSegment: 2 },
            { id: 'B', text: "Ask about the artifact's origin", nextSegment: 3 },
            { id: 'C', text: "Politely decline and explore alone", nextSegment: 4 }
          ]
        },
        {
          id: 2,
          text: `The artifact pulses with warm energy as you take it. The hooded figure nods approvingly and leads you through narrow alleyways that seem to bend reality itself. You arrive at a hidden door marked with symbols that match those on the artifact.`,
          image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop",
          choices: [
            { id: 'A', text: "Touch the artifact to the door", nextSegment: 5 },
            { id: 'B', text: "Study the symbols more carefully", nextSegment: 6 }
          ]
        }
      ],
      culturalInsights: [
        `${location.split(',')[0]} has been a crossroads of cultures for over 1,000 years.`,
        "Local folklore speaks of hidden passages beneath the old quarter.",
        "The marketplace has been the heart of the city since medieval times."
      ]
    };
    
    onStoryGenerated(story);
    setIsGenerating(false);
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="glass-card p-4 space-y-2">
            <Sparkles className="w-6 h-6 text-mystical-accent mx-auto" />
            <h4 className="font-semibold text-mystical-accent">Interactive Story</h4>
            <p className="text-white/70">Make choices that shape your adventure</p>
          </div>
          <div className="glass-card p-4 space-y-2">
            <Image className="w-6 h-6 text-mystical-accent mx-auto" />
            <h4 className="font-semibold text-mystical-accent">AI Visuals</h4>
            <p className="text-white/70">Beautiful scenes generated for each chapter</p>
          </div>
          <div className="glass-card p-4 space-y-2">
            <Share className="w-6 h-6 text-mystical-accent mx-auto" />
            <h4 className="font-semibold text-mystical-accent">Cultural Insights</h4>
            <p className="text-white/70">Learn fascinating facts about the location</p>
          </div>
        </div>

        <Button 
          onClick={generateStory}
          className="mystical-button text-lg px-8 py-3"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Generate My Story
        </Button>
      </div>
    </Card>
  );
};

export default StoryGenerator;
