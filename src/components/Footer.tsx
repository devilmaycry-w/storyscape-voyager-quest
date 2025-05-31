
import { ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-mystical-accent/20 pt-8 pb-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-white/70">Built with</span>
            <a 
              href="https://bolt.new/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-mystical-accent hover:text-mystical-accent/80 transition-colors font-semibold"
            >
              <span>Bolt.new</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-white/60">
            <a href="#privacy" className="hover:text-mystical-accent transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-mystical-accent transition-colors">
              Terms of Use
            </a>
            <a href="#contact" className="hover:text-mystical-accent transition-colors">
              Contact
            </a>
          </div>
          
          <p className="text-white/50 text-sm">
            © 2024 StoryScape. Weaving tales across the digital realm.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
