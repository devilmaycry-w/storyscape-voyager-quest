
import { useState } from "react";
import { User, Wand2, Palette, BookOpen, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CharacterCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCharacterCreated?: (character: any) => void;
}

const CharacterCreator = ({ isOpen, onClose, onCharacterCreated }: CharacterCreatorProps) => {
  const [step, setStep] = useState(1);
  const [character, setCharacter] = useState({
    name: "",
    description: "",
    appearance: {
      height: "",
      build: "",
      hair: "",
      eyes: "",
      clothing: ""
    },
    personality_traits: {
      brave: 5,
      intelligent: 5,
      charismatic: 5,
      mysterious: 5
    },
    background_story: "",
    stats: {
      strength: 10,
      intelligence: 10,
      charisma: 10,
      wisdom: 10
    },
    voice_id: "Alice"
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const voices = [
    { id: "Alice", name: "Alice", description: "Warm and friendly" },
    { id: "Brian", name: "Brian", description: "Deep and authoritative" },
    { id: "Charlie", name: "Charlie", description: "Youthful and energetic" },
    { id: "Dorothy", name: "Dorothy", description: "Wise and maternal" }
  ];

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a character",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('characters')
        .insert({
          user_id: user.id,
          name: character.name,
          description: character.description,
          appearance: character.appearance,
          personality_traits: character.personality_traits,
          background_story: character.background_story,
          stats: character.stats,
          voice_id: character.voice_id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Character created!",
        description: `${character.name} has been brought to life.`
      });

      if (onCharacterCreated) {
        onCharacterCreated(data);
      }

      onClose();
      setStep(1);
      setCharacter({
        name: "",
        description: "",
        appearance: { height: "", build: "", hair: "", eyes: "", clothing: "" },
        personality_traits: { brave: 5, intelligent: 5, charismatic: 5, mysterious: 5 },
        background_story: "",
        stats: { strength: 10, intelligence: 10, charisma: 10, wisdom: 10 },
        voice_id: "Alice"
      });
    } catch (error) {
      console.error('Error creating character:', error);
      toast({
        title: "Creation failed",
        description: "Failed to create character. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <User className="w-12 h-12 text-mystical-accent mx-auto" />
              <h3 className="text-xl font-mystical text-mystical-accent">Basic Information</h3>
              <p className="text-white/70">Give your character a name and identity</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Character Name</label>
                <Input
                  value={character.name}
                  onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                  placeholder="Enter character name..."
                  className="glass-card border-mystical-accent/30"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Description</label>
                <Textarea
                  value={character.description}
                  onChange={(e) => setCharacter({ ...character, description: e.target.value })}
                  placeholder="Describe your character..."
                  className="glass-card border-mystical-accent/30 min-h-[100px]"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Palette className="w-12 h-12 text-mystical-accent mx-auto" />
              <h3 className="text-xl font-mystical text-mystical-accent">Appearance</h3>
              <p className="text-white/70">Define how your character looks</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(character.appearance).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-white/80 mb-2 capitalize">{key}</label>
                  <Input
                    value={value}
                    onChange={(e) => setCharacter({
                      ...character,
                      appearance: { ...character.appearance, [key]: e.target.value }
                    })}
                    placeholder={`Character's ${key}...`}
                    className="glass-card border-mystical-accent/30"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Wand2 className="w-12 h-12 text-mystical-accent mx-auto" />
              <h3 className="text-xl font-mystical text-mystical-accent">Personality & Stats</h3>
              <p className="text-white/70">Shape your character's nature and abilities</p>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-white/80 mb-3">Personality Traits</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(character.personality_traits).map(([trait, value]) => (
                    <div key={trait} className="space-y-2">
                      <label className="block text-white/70 capitalize">{trait}</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={value}
                        onChange={(e) => setCharacter({
                          ...character,
                          personality_traits: {
                            ...character.personality_traits,
                            [trait]: parseInt(e.target.value)
                          }
                        })}
                        className="w-full"
                      />
                      <span className="text-mystical-accent text-sm">{value}/10</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-white/80 mb-3">Core Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(character.stats).map(([stat, value]) => (
                    <div key={stat} className="space-y-2">
                      <label className="block text-white/70 capitalize">{stat}</label>
                      <input
                        type="range"
                        min="5"
                        max="20"
                        value={value}
                        onChange={(e) => setCharacter({
                          ...character,
                          stats: {
                            ...character.stats,
                            [stat]: parseInt(e.target.value)
                          }
                        })}
                        className="w-full"
                      />
                      <span className="text-mystical-accent text-sm">{value}/20</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <BookOpen className="w-12 h-12 text-mystical-accent mx-auto" />
              <h3 className="text-xl font-mystical text-mystical-accent">Background & Voice</h3>
              <p className="text-white/70">Complete your character's story</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Background Story</label>
                <Textarea
                  value={character.background_story}
                  onChange={(e) => setCharacter({ ...character, background_story: e.target.value })}
                  placeholder="Tell your character's backstory..."
                  className="glass-card border-mystical-accent/30 min-h-[120px]"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Voice</label>
                <div className="grid grid-cols-2 gap-2">
                  {voices.map((voice) => (
                    <Card
                      key={voice.id}
                      className={`p-3 cursor-pointer transition-all ${
                        character.voice_id === voice.id
                          ? 'border-mystical-accent bg-mystical-accent/10'
                          : 'glass-card border-mystical-accent/30'
                      }`}
                      onClick={() => setCharacter({ ...character, voice_id: voice.id })}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-white">{voice.name}</div>
                        <div className="text-white/60 text-sm">{voice.description}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-mystical-accent/30 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mystical text-mystical-accent glow-text">
            Create Your Character
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber
                    ? 'bg-mystical-accent text-white'
                    : 'bg-white/20 text-white/60'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>

          {renderStep()}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="glass-card border-mystical-accent/30"
            >
              Previous
            </Button>
            
            {step < 4 ? (
              <Button
                onClick={() => setStep(Math.min(4, step + 1))}
                disabled={!character.name.trim()}
                className="mystical-button"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={loading || !character.name.trim()}
                className="mystical-button"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Creating...' : 'Create Character'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CharacterCreator;
