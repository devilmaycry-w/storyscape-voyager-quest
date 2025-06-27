
import { useState } from "react";
import { User, Wand2, Palette, BookOpen, Save, Sparkles } from "lucide-react"; // Added Sparkles for AI button
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateText } from "@/integrations/openai/client"; // Import OpenAI client

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
  const [isGeneratingBackground, setIsGeneratingBackground] = useState(false);
  // State to store AI generation metadata
  const [aiMetadata, setAiMetadata] = useState({
    generation_prompt: null as string | null,
    ai_generated_character: false, // Specifically for background story part
    character_error_log: null as string | null,
    used_fallback_character: false, // Specifically for background story part
  });
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
          voice_id: character.voice_id,
          // Add AI metadata fields
          generation_prompt: aiMetadata.generation_prompt,
          ai_generated_character: aiMetadata.ai_generated_character,
          character_error_log: aiMetadata.character_error_log,
          used_fallback_character: aiMetadata.used_fallback_character,
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

  const handleGenerateBackground = async () => {
    if (!character.name && !character.description) {
      toast({
        title: "Missing Information",
        description: "Please enter character name and description before generating a background.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingBackground(true);
    let newBackground = "";
    let currentAiMetadata = {
      generation_prompt: null as string | null,
      ai_generated_character: false,
      character_error_log: null as string | null,
      used_fallback_character: false,
    };

    const personalityString = Object.entries(character.personality_traits)
      .map(([trait, value]) => `${trait}: ${value}/10`)
      .join(", ");

    currentAiMetadata.generation_prompt = `Generate a concise and compelling background story (around 100-150 words) for a character with the following details:
Name: ${character.name || "Unnamed"}
Description: ${character.description || "Not specified"}
Personality Traits: ${personalityString || "Not specified"}
Focus on creating an intriguing origin or a defining past event.`;

    try {
      const aiResponse = await generateText(currentAiMetadata.generation_prompt);
      if (aiResponse) {
        newBackground = aiResponse;
        currentAiMetadata.ai_generated_character = true;
        toast({
          title: "Background Generated!",
          description: "AI has drafted a background story for your character.",
        });
      } else {
        throw new Error("AI service returned no response.");
      }
    } catch (error) {
      console.error("Error generating character background:", error);
      currentAiMetadata.character_error_log = error instanceof Error ? error.message : String(error);
      currentAiMetadata.used_fallback_character = true;
      newBackground = "The mists of time have clouded this character's past. Perhaps you can unveil their story? (AI generation failed, please write manually or try again later.)";
      toast({
        title: "AI Background Failed",
        description: "Using a fallback. Please write manually or try again.",
        variant: "default",
      });
    } finally {
      setCharacter(prev => ({ ...prev, background_story: newBackground }));
      setAiMetadata(prev => ({ ...prev, ...currentAiMetadata })); // Merge new AI metadata
      setIsGeneratingBackground(false);
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
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-white/80">Background Story</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateBackground}
                    disabled={isGeneratingBackground}
                    className="text-xs mystical-button-outline"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {isGeneratingBackground ? "Generating..." : "Generate with AI"}
                  </Button>
                </div>
                <Textarea
                  value={character.background_story}
                  onChange={(e) => {
                    setCharacter({ ...character, background_story: e.target.value });
                    // If user types, assume it's not AI generated or fallback anymore for this specific field
                    setAiMetadata(prev => ({
                        ...prev,
                        ai_generated_character: false,
                        used_fallback_character: false,
                        character_error_log: null,
                        // generation_prompt could be kept or cleared depending on desired behavior
                    }));
                  }}
                  placeholder="Tell your character's backstory, or generate one with AI..."
                  className="glass-card border-mystical-accent/30 min-h-[120px]"
                  disabled={isGeneratingBackground}
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
