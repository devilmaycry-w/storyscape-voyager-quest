import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface InteractiveMapProps {
  onLocationSelect: (location: string) => void;
  onClose: () => void;
}

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const InteractiveMap = ({ onLocationSelect, onClose }: InteractiveMapProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const { toast } = useToast();

  // Search for locations using Nominatim API
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Unable to search locations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Reverse geocoding to get location name from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        const locationName = data.display_name.split(',').slice(0, 2).join(',').trim();
        setSelectedLocation({ lat, lng, name: locationName });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      toast({
        title: "Location lookup failed",
        description: "Unable to get location details.",
        variant: "destructive"
      });
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchLocations(searchQuery);
  };

  const handleLocationClick = (result: LocationResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const locationName = result.display_name.split(',').slice(0, 2).join(',').trim();
    
    setSelectedLocation({ lat, lng, name: locationName });
    setSearchResults([]);
    setSearchQuery('');
    
    // Pan map to selected location
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 12);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    reverseGeocode(lat, lng);
  };

  const handleSelectLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation.name);
      onClose();
    }
  };

  const handleRandomLocation = () => {
    const randomLat = (Math.random() - 0.5) * 180;
    const randomLng = (Math.random() - 0.5) * 360;
    reverseGeocode(randomLat, randomLng);
    
    if (mapRef.current) {
      mapRef.current.setView([randomLat, randomLng], 8);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 2) {
        searchLocations(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <Input
            type="text"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-card border-mystical-accent/30 text-white placeholder:text-white/60"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mystical-accent animate-spin" />
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-card border border-mystical-accent/30 rounded-lg overflow-hidden z-10 max-h-60 overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                onClick={() => handleLocationClick(result)}
                className="w-full text-left px-4 py-3 hover:bg-mystical-accent/10 transition-colors border-b border-white/10 last:border-b-0"
              >
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-mystical-accent mt-0.5 flex-shrink-0" />
                  <span className="text-white text-sm">{result.display_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleRandomLocation}
          variant="outline"
          size="sm"
          className="glass-card border-mystical-accent/30"
        >
          Random Location
        </Button>
        {isReverseGeocoding && (
          <div className="flex items-center space-x-2 text-mystical-accent text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Finding location...</span>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative">
        <div className="h-96 w-full rounded-lg overflow-hidden border border-mystical-accent/30">
          <MapContainer
            center={[40.7128, -74.0060]} // Default to New York
            zoom={3}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={handleMapClick} />
            {selectedLocation && (
              <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold">{selectedLocation.name}</p>
                    <p className="text-xs text-gray-600">
                      {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Selected Location Info */}
        {selectedLocation && (
          <div className="mt-4 glass-card p-4 border border-mystical-accent/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-mystical-accent">Selected Location</h3>
                <p className="text-white/80 text-sm">{selectedLocation.name}</p>
                <p className="text-white/60 text-xs">
                  {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </p>
              </div>
              <Button
                onClick={handleSelectLocation}
                className="mystical-button"
              >
                Select This Location
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-white/60 text-sm">
        <p>Click anywhere on the map to select a location, or search for a specific place above.</p>
      </div>
    </div>
  );
};

export default InteractiveMap;