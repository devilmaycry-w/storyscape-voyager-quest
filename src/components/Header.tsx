import { useState } from "react";
import { Share, Users, Search, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import SearchModal from "./SearchModal";
import ExploreModal from "./ExploreModal";
import CommunityModal from "./CommunityModal";
import CreateStoryModal from "./CreateStoryModal";
import ShareModal from "./ShareModal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface HeaderProps {
  onLocationSelect?: (location: string) => void;
}

const Header = ({ onLocationSelect }: HeaderProps) => {
  const { signOut, user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
  };

  const handleLocationSelect = (location: string) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const MobileMenu = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-mystical-primary/95 backdrop-blur-lg border-none">
        <nav className="flex flex-col gap-4 mt-8">
          <Button 
            variant="ghost" 
            onClick={() => {
              setExploreOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full justify-start text-white hover:text-mystical-accent"
          >
            Explore
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => {
              setCommunityOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full justify-start text-white hover:text-mystical-accent"
          >
            Community
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => {
              setCreateOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full justify-start text-white hover:text-mystical-accent"
          >
            Create
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => {
              setSearchOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full justify-start text-white hover:text-mystical-accent"
          >
            Search
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <header className="sticky top-0 z-50 glass-card border-b border-mystical-accent/20 px-4 py-3 mb-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-mystical-accent rounded-full flex items-center justify-center animate-glow">
              <span className="text-mystical-primary font-bold text-lg">S</span>
            </div>
            <h1 className="font-mystical text-2xl font-bold glow-text">
              StoryScape
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setExploreOpen(true)}
              className="text-foreground/80 hover:text-mystical-accent transition-colors cursor-pointer"
            >
              Explore
            </button>
            <button 
              onClick={() => setCommunityOpen(true)}
              className="text-foreground/80 hover:text-mystical-accent transition-colors cursor-pointer"
            >
              Community
            </button>
            <button 
              onClick={() => setCreateOpen(true)}
              className="text-foreground/80 hover:text-mystical-accent transition-colors cursor-pointer"
            >
              Create
            </button>
          </nav>

          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden sm:flex"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCommunityOpen(true)}
            >
              <Users className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShareOpen(true)}
            >
              <Share className="w-4 h-4" />
            </Button>
            {user && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-mystical-accent hover:text-mystical-accent/80"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <ExploreModal 
        isOpen={exploreOpen} 
        onClose={() => setExploreOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
      <CommunityModal isOpen={communityOpen} onClose={() => setCommunityOpen(false)} />
      <CreateStoryModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} />
      <MobileMenu />
    </>
  );
};

export default Header;