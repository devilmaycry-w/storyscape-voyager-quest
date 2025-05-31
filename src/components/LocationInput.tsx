
import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LocationInputProps {
  onLocationSelect: (location: string) => void;
}

const LocationInput = ({ onLocationSelect }: LocationInputProps) => {
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Simulated popular locations - in production, this would use Google Places API
  const popularLocations = [
    "Paris, France",
    "Tokyo, Japan", 
    "New York, USA",
    "London, England",
    "Rome, Italy",
    "Barcelona, Spain",
    "Istanbul, Turkey",
    "Cairo, Egypt"
  ];

  const handleInputChange = (value: string) => {
    setLocation(value);
    if (value.length > 2) {
      const filtered = popularLocations.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = () => {
    if (location.trim()) {
      onLocationSelect(location);
      setSuggestions([]);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mystical-accent" />
          <Input
            type="text"
            placeholder="Enter a city or landmark..."
            value={location}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="pl-10 pr-12 py-3 glass-card border-mystical-accent/30 text-white placeholder:text-white/60 focus:border-mystical-accent"
          />
          <Button
            onClick={handleSubmit}
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 mystical-button"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-card border border-mystical-accent/30 rounded-lg overflow-hidden z-10">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setLocation(suggestion);
                  onLocationSelect(suggestion);
                  setSuggestions([]);
                }}
                className="w-full text-left px-4 py-3 hover:bg-mystical-accent/10 transition-colors border-b border-white/10 last:border-b-0"
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-mystical-accent" />
                  <span className="text-white">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-white/70 text-sm mb-3">Or choose a popular destination:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {popularLocations.slice(0, 4).map((loc, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => {
                setLocation(loc);
                onLocationSelect(loc);
              }}
              className="glass-card border-mystical-accent/30 text-white hover:bg-mystical-accent/10 text-xs"
            >
              {loc.split(',')[0]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationInput;
