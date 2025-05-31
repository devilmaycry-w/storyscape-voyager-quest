
import { useState } from "react";
import Header from "@/components/Header";
import LocationInput from "@/components/LocationInput";
import StoryGenerator from "@/components/StoryGenerator";
import StoryViewer from "@/components/StoryViewer";
import CommunityStories from "@/components/CommunityStories";
import Footer from "@/components/Footer";
import { Sparkles, Map, Users, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [generatedStory, setGeneratedStory] = useState(null);
  const [currentView, setCurrentView] = useState<'home' | 'generate' | 'story' | 'community'>('home');

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setCurrentView('generate');
  };

  const handleStoryGenerated = (story: any) => {
    setGeneratedStory(story);
    setCurrentView('story');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedLocation("");
    setGeneratedStory(null);
  };

  const renderHeroSection = () => (
    <div className="text-center space-y-8 mb-12">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-mystical font-bold glow-text">
          StoryScape
        </h1>
        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
          Discover enchanting tales woven from the soul of every place on Earth
        </p>
        <p className="text-lg text-white/70 max-w-2xl mx-auto">
          AI-powered interactive stories that bring locations to life through immersive adventures you control
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
        <Button 
          onClick={() => setCurrentView('generate')}
          className="mystical-button text-lg px-8 py-3"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Start Your Adventure
        </Button>
        <Button 
          onClick={() => setCurrentView('community')}
          variant="outline" 
          className="glass-card border-mystical-accent/30 text-lg px-8 py-3"
        >
          <Users className="w-5 h-5 mr-2" />
          Explore Community
        </Button>
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {[
        {
          icon: <Map className="w-8 h-8 text-mystical-accent" />,
          title: "Any Location",
          description: "From bustling cities to hidden landmarks"
        },
        {
          icon: <Sparkles className="w-8 h-8 text-mystical-accent" />,
          title: "AI-Powered",
          description: "Unique stories generated for every adventure"
        },
        {
          icon: <Users className="w-8 h-8 text-mystical-accent" />,
          title: "Interactive",
          description: "Make choices that shape your journey"
        },
        {
          icon: <Share className="w-8 h-8 text-mystical-accent" />,
          title: "Shareable",
          description: "Share your stories with the world"
        }
      ].map((feature, index) => (
        <div key={index} className="story-card text-center space-y-3">
          <div className="flex justify-center animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
            {feature.icon}
          </div>
          <h3 className="font-mystical text-lg text-mystical-accent">
            {feature.title}
          </h3>
          <p className="text-white/70 text-sm">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-mystical-gradient">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentView === 'home' && (
          <>
            {renderHeroSection()}
            {renderFeatures()}
            <CommunityStories isVisible={true} />
          </>
        )}

        {currentView === 'generate' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-mystical text-mystical-accent glow-text">
                Where shall we venture?
              </h2>
              <p className="text-white/80">
                Choose your destination and let the magic begin
              </p>
            </div>
            
            <LocationInput onLocationSelect={handleLocationSelect} />
            
            {selectedLocation && (
              <StoryGenerator 
                location={selectedLocation} 
                onStoryGenerated={handleStoryGenerated}
              />
            )}
            
            <div className="text-center">
              <Button 
                onClick={handleBackToHome}
                variant="outline" 
                className="glass-card border-mystical-accent/30"
              >
                Back to Home
              </Button>
            </div>
          </div>
        )}

        {currentView === 'story' && generatedStory && (
          <div className="max-w-4xl mx-auto">
            <StoryViewer 
              story={generatedStory} 
              onBack={handleBackToHome}
            />
          </div>
        )}

        {currentView === 'community' && (
          <div className="space-y-8">
            <CommunityStories isVisible={true} />
            <div className="text-center">
              <Button 
                onClick={handleBackToHome}
                variant="outline" 
                className="glass-card border-mystical-accent/30"
              >
                Back to Home
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
