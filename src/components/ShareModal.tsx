
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Facebook, Twitter, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal = ({ isOpen, onClose }: ShareModalProps) => {
  const { toast } = useToast();
  const currentUrl = window.location.href;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    toast({
      title: "Link copied!",
      description: "StoryScape link has been copied to your clipboard.",
    });
  };

  const shareToSocial = (platform: string) => {
    const text = "Check out StoryScape - AI-powered interactive stories!";
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    };
    
    window.open(urls[platform as keyof typeof urls], '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share StoryScape
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share the magic of AI-powered storytelling with your friends!
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => shareToSocial('twitter')}>
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            <Button variant="outline" onClick={() => shareToSocial('facebook')}>
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="outline" onClick={copyToClipboard}>
              <Link className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
