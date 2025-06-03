
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Star, TrendingUp } from "lucide-react";

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommunityModal = ({ isOpen, onClose }: CommunityModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Community Hub
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Trophy className="w-6 h-6 mb-2 text-yellow-500" />
              <span>Top Storytellers</span>
              <span className="text-xs text-muted-foreground">This Month</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Star className="w-6 h-6 mb-2 text-blue-500" />
              <span>Featured Stories</span>
              <span className="text-xs text-muted-foreground">Editor's Choice</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="w-6 h-6 mb-2 text-green-500" />
              <span>Rising Creators</span>
              <span className="text-xs text-muted-foreground">New Talent</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="w-6 h-6 mb-2 text-purple-500" />
              <span>Join Challenges</span>
              <span className="text-xs text-muted-foreground">Weekly Themes</span>
            </Button>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">Community Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-xs text-muted-foreground">Active Writers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">3,892</div>
                <div className="text-xs text-muted-foreground">Stories Created</div>
              </div>
              <div>
                <div className="text-2xl font-bold">15,643</div>
                <div className="text-xs text-muted-foreground">Total Reads</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityModal;
