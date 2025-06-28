import { useState } from "react";
import { Loader2, Sparkles, Image, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StoryGeneratorProps {
  location: string;
  onStoryGenerated: (story: any) => void;
}

const randomImages = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1533055640609-24b498cdfd4f?w=400&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=300&fit=crop&q=80",
];

const getRandomImage = () => {
  const randomIndex = Math.floor(Math.random() * randomImages.length);
  return randomImages[randomIndex];
};

const generateStoryWithAI = async (location: string) => {
  try {
    const url = "https://api.chatanywhere.tech/v1/chat/completions";
    const headers = {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_CHATANYWHERE_API_KEY}`,
      "Content-Type": "application/json",
    };

    const data = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Write a short, interactive story about ${location}. Include mystery, cultural insights, and decision points. Format as a title line, then 3-5 sentences of story, then three choices (A., B., C.), each on its own line. Do NOT include any images.`,
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!responseData.choices || responseData.choices.length === 0) {
      throw new Error("No choices returned from AI");
    }

    const storyContent = responseData.choices[0]?.message?.content || "";
    if (!storyContent) {
      throw new Error("No content returned from AI");
    }

    // Parse the AI response into title, main text, and choices
    const lines = storyContent.split("\n").map(line => line.trim()).filter(Boolean);

    // Extract title
    let title = `The Mystery of ${location}`;
    if (lines[0]?.toLowerCase().startsWith("title:")) {
      title = lines[0].slice(6).trim();
      lines.shift();
    } else if (lines[0]) {
      title = lines[0];
      lines.shift();
    }

    // Separate story text and choices
    let storyLines: string[] = [];
    let choiceLines: string[] = [];
    let foundChoices = false;
    for (const line of lines) {
      if (/^[a-cA-C][\.\:]/.test(line) || /^\d+\./.test(line)) {
        foundChoices = true;
      }
      if (foundChoices) {
        choiceLines.push(line);
      } else {
        storyLines.push(line);
      }
    }
    const text = storyLines.join(" ");
    let choices = [
      { id: "A", text: "Explore the mysterious alleyways", nextSegment: 2 },
      { id: "B", text: "Visit the local marketplace", nextSegment: 3 },
      { id: "C", text: "Seek out the town's historian", nextSegment: 4 },
    ];
    if (choiceLines.length >= 3) {
      choices = choiceLines.slice(0, 3).map((l, i) => ({
        id: String.fromCharCode(65 + i),
        text: l.replace(/^([a-cA-C][\.\:]|\d+\.)\s*/, ""),
        nextSegment: i + 2,
      }));
    }

    // Always add a random image (AI does NOT generate images)
    return {
      title,
      segments: [
        {
          id: 1,
          text,
          image: getRandomImage(),
          choices,
        },
      ],
      culturalInsights: [
        `${location} has a rich cultural heritage spanning centuries.`,
        "Local traditions are deeply woven into daily life.",
        "The architecture tells stories of different historical periods.",
      ],
    };
  } catch (error) {
    console.error("Error generating story with AI:", error);
    return null;
  }
};

const generateMockStory = async (location: string) => {
  // Mock story data
  return {
    title: `The Mystery of ${location}`,
    segments: [
      {
        id: 1,
        text: `In the heart of ${location}, an adventure unfolds that will change everything. The ancient streets whisper secrets of the past while modern life bustles around you. The air is thick with mystery and possibility.`,
        image: getRandomImage(),
        choices: [
          { id: "A", text: "Explore the mysterious alleyways", nextSegment: 2 },
          { id: "B", text: "Visit the local marketplace", nextSegment: 3 },
          { id: "C", text: "Seek out the town's historian", nextSegment: 4 },
        ],
      },
      {
        id: 2,
        text: "The narrow alleyways reveal hidden murals and forgotten doorways. Each step takes you deeper into the soul of the city, where ancient stories come alive in the shadows.",
        image: getRandomImage(),
        choices: [
          { id: "A", text: "Follow the murals to their source", nextSegment: 5 },
          { id: "B", text: "Knock on an ancient door", nextSegment: 6 },
        ],
      },
    ],
    culturalInsights: [
      `${location} has a rich cultural heritage spanning centuries.`,
      "Local traditions are deeply woven into daily life.",
      "The architecture tells stories of different historical periods.",
    ],
  };
};

const StoryGenerator = ({ location, onStoryGenerated }: StoryGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateStory = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate stories",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      let storyData = await generateStoryWithAI(location);

      // Fallback to mock generation if AI fails
      if (!storyData) {
        storyData = await generateMockStory(location);
      }

      // Save story to database
      const { data: savedStory, error: saveError } = await supabase
        .from("stories")
        .insert({
          user_id: user.id,
          title: storyData.title,
          location: location,
          content: storyData,
          cultural_insights: storyData.culturalInsights,
          image_urls: storyData.segments?.map((s: any) => s.image) || [],
          is_public: true,
        })
        .select()
        .single();

      if (saveError) {
        throw saveError;
      }

      onStoryGenerated({
        id: savedStory.id,
        location: location,
        ...storyData,
      });

      toast({
        title: "Story created!",
        description: "Your magical tale has been woven!",
      });
    } catch (error) {
      console.error("Error generating story:", error);
      toast({
        title: "Generation failed",
        description: "Failed to create story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <Card className="story-card text-center py-12">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-mystical-accent animate-spin" />
              <Sparkles className="w-6 h-6 text-mystical-accent absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-sparkle" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-mystical text-mystical-accent">
              Weaving Your Story...
            </h3>
            <p className="text-white/70">
              Gathering the mystical threads of {location}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="story-card text-center">
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-mystical text-mystical-accent glow-text">
            Discover the Stories of {location.split(",")[0]}
          </h3>
          <p className="text-white/80">
            Let us weave an enchanting tale based on the rich history and culture of your chosen location
          </p>
        </div>

        <Button
          onClick={generateStory}
          className="text-lg px-8 py-3 mystical-button"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Generate My Story
        </Button>
      </div>
    </Card>
  );
};

export default StoryGenerator;
