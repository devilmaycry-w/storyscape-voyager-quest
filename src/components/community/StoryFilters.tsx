
import { Button } from "@/components/ui/button";

interface StoryFiltersProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

const StoryFilters = ({ filter, onFilterChange }: StoryFiltersProps) => {
  const filters = ['popular', 'recent', 'trending'];

  return (
    <div className="flex justify-center space-x-2">
      {filters.map((filterType) => (
        <Button
          key={filterType}
          variant={filter === filterType ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filterType)}
          className={filter === filterType ? "mystical-button" : "glass-card border-mystical-accent/30"}
        >
          {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
        </Button>
      ))}
    </div>
  );
};

export default StoryFilters;
