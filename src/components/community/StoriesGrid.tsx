import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import StoryCard from "./StoryCard";
import type { Story } from "@/hooks/useStories";

interface StoriesGridProps {
  stories: Story[];
  isLoading: boolean;
  error: Error | null;
  onUpvote: (storyId: string) => void;
  onRead: (story: Story) => void;
  onStop: () => void;
  readingStoryId: string | null;
}

const StoriesGrid = ({ stories, isLoading, error, onUpvote, onRead, onStop, readingStoryId }: StoriesGridProps) => {
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-mystical-accent border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-white/70">Loading stories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Error loading stories. Please try again.</p>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['stories'] })}
          className="mt-4"
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70">No stories found. Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <StoryCard 
          key={story.id}
          story={story}
          onUpvote={onUpvote}
          onRead={onRead}
          onStop={onStop}
          isReading={readingStoryId === story.id}
        />
      ))}
    </div>
  );
};

export default StoriesGrid;
