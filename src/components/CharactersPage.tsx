
import { useState, useEffect } from "react";
import { Plus, User, Wand2, Trash2, Edit, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip components
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CharacterCreator from "./CharacterCreator";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Character {
  id: string;
  name: string;
  description: string;
  appearance: any;
  personality_traits: any;
  background_story: string;
  stats: any;
  voice_id: string;
  created_at: string;
  // New fields from schema
  generation_prompt?: string | null;
  ai_generated_character?: boolean;
  character_error_log?: string | null;
  used_fallback_character?: boolean;
}

const CharactersPage = () => {
  const [showCreator, setShowCreator] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['characters', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Character[];
    },
    enabled: !!user
  });

  const handleDeleteCharacter = async (characterId: string) => {
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['characters'] });
      
      toast({
        title: "Character deleted",
        description: "Your character has been removed."
      });
    } catch (error) {
      console.error('Error deleting character:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete character. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCharacterCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['characters'] });
  };

  if (!user) {
    return (
      <div className="text-center py-16">
        <User className="w-16 h-16 text-mystical-accent mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-mystical text-mystical-accent mb-2">Authentication Required</h2>
        <p className="text-white/70">Please sign in to create and manage your characters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-mystical text-mystical-accent glow-text">
          Your Characters
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto">
          Create and manage the heroes, villains, and companions of your stories
        </p>
        <Button
          onClick={() => setShowCreator(true)}
          className="mystical-button"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Character
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-mystical-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Loading your characters...</p>
        </div>
      ) : characters.length === 0 ? (
        <div className="text-center py-16">
          <Wand2 className="w-16 h-16 text-mystical-accent mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-mystical text-mystical-accent mb-2">No Characters Yet</h2>
          <p className="text-white/70 mb-6">
            Start your storytelling journey by creating your first character
          </p>
          <Button
            onClick={() => setShowCreator(true)}
            className="mystical-button"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Character
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <Card key={character.id} className="story-card overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-mystical text-xl text-mystical-accent">
                      {character.name}
                    </h3>
                    <p className="text-white/70 text-sm line-clamp-2">
                      {character.description}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-mystical-accent hover:bg-mystical-accent/10 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCharacter(character.id)}
                      className="text-red-400 hover:bg-red-400/10 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-white/80 text-sm font-semibold mb-1">Stats</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(character.stats || {}).map(([stat, value]) => (
                        <div key={stat} className="flex justify-between">
                          <span className="text-white/60 capitalize">{stat}</span>
                          <span className="text-mystical-accent">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white/80 text-sm font-semibold mb-1">Voice</h4>
                    <span className="text-mystical-accent text-sm">{character.voice_id}</span>
                  </div>

                  {character.background_story && (
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white/80 text-sm font-semibold">Background</h4>
                        {character.used_fallback_character && (
                          <TooltipProvider>
                            <Tooltip delayDuration={100}>
                              <TooltipTrigger>
                                <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-black text-white border-yellow-400">
                                <p>The AI-generated background story failed. Fallback or manually entered content is shown.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <p className="text-white/60 text-xs line-clamp-3">
                        {character.background_story}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-white/10">
                  <p className="text-white/50 text-xs">
                    Created {new Date(character.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CharacterCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onCharacterCreated={handleCharacterCreated}
      />
    </div>
  );
};

export default CharactersPage;
