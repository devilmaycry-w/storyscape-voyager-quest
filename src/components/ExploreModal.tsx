import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Map, Compass, Globe, ArrowLeft } from "lucide-react";
import InteractiveMap from "./InteractiveMap";

interface ExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: string) => void;
}

const ExploreModal = ({ isOpen, onClose, onLocationSelect }: ExploreModalProps) => {
  const [showMap, setShowMap] = useState(false);
  
  const popularLocations = [
    "Paris, France",
    "Tokyo, Japan", 
    "New York, USA",
    "London, UK",
    "Rome, Italy",
    "Barcelona, Spain",
    "Bangkok, Thailand",
    "Prague, Czech Republic"
  ];

  const handleLocationClick = (location: string) => {
    onLocationSelect(location);
    onClose();
    setShowMap(false);
  };

  const handleMapLocationSelect = (location: string) => {
    onLocationSelect(location);
    onClose();
    setShowMap(false);
  };

  const handleRandomLocation = () => {
    const randomLocation = popularLocations[Math.floor(Math.random() * popularLocations.length)];
    handleLocationClick(randomLocation);
  };

  const handleBackToExplore = () => {
    setShowMap(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-mystical-accent/30 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-mystical-accent">
            {showMap && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToExplore}
                className="mr-2 text-mystical-accent hover:bg-mystical-accent/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Compass className="w-5 h-5" />
            {showMap ? "Interactive Map" : "Explore Destinations"}
          </DialogTitle>
        </DialogHeader>
        
        {showMap ? (
          <InteractiveMap 
            onLocationSelect={handleMapLocationSelect}
            onClose={onClose}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col glass-card border-mystical-accent/30 hover:bg-mystical-accent/10"
                onClick={() => setShowMap(true)}
              >
                <Map className="w-6 h-6 mb-2 text-mystical-accent" />
                <span className="text-white">Interactive Map</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col glass-card border-mystical-accent/30 hover:bg-mystical-accent/10"
                onClick={handleRandomLocation}
              >
                <Globe className="w-6 h-6 mb-2 text-mystical-accent" />
                <span className="text-white">Random Location</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col glass-card border-mystical-accent/30 hover:bg-mystical-accent/10"
              >
                <Compass className="w-6 h-6 mb-2 text-mystical-accent" />
                <span className="text-white">Trending Places</span>
              </Button>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-mystical-accent">Popular Destinations</h3>
              <div className="grid grid-cols-2 gap-2">
                {popularLocations.map((location) => (
                  <Button
                    key={location}
                    variant="ghost"
                    className="justify-start text-white hover:bg-mystical-accent/10 hover:text-mystical-accent"
                    onClick={() => handleLocationClick(location)}
                  >
                    {location}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExploreModal;