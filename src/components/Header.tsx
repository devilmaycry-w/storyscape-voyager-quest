
import { Share, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
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
          <a href="#explore" className="text-foreground/80 hover:text-mystical-accent transition-colors">
            Explore
          </a>
          <a href="#community" className="text-foreground/80 hover:text-mystical-accent transition-colors">
            Community
          </a>
          <a href="#create" className="text-foreground/80 hover:text-mystical-accent transition-colors">
            Create
          </a>
        </nav>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button variant="ghost" size="sm">
            <Users className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
