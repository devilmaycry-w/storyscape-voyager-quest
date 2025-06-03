
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Map, Compass, Globe } from "lucide-react";

interface ExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: string) => void;
}

const ExploreModal = ({ isOpen, onClose, onLocationSelect }: ExploreModalProps) => {
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Compass className="w-5 h-5" />
            Explore Destinations
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Map className="w-6 h-6 mb-2" />
              Interactive Map
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Globe className="w-6 h-6 mb-2" />
              Random Location
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Compass className="w-6 h-6 mb-2" />
              Trending Places
            </Button>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Popular Destinations</h3>
            <div className="grid grid-cols-2 gap-2">
              {popularLocations.map((location) => (
                <Button
                  key={location}
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleLocationClick(location)}
                >
                  {location}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExploreModal;
