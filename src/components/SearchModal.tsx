
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
        .eq('is_public', true)
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: searchQuery.length > 2
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Stories
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Search by title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          
          {isLoading && <p className="text-center py-4">Searching...</p>}
          
          {searchResults && searchResults.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((story) => (
                <div key={story.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <h3 className="font-semibold">{story.title}</h3>
                  <p className="text-sm text-muted-foreground">{story.location}</p>
                  <p className="text-xs text-muted-foreground">
                    {story.upvotes} upvotes
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {searchQuery.length > 2 && searchResults?.length === 0 && !isLoading && (
            <p className="text-center py-4 text-muted-foreground">No stories found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
