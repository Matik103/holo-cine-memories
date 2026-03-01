import { MysteryFilter, MysterySort } from '@/services/mysteryService';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Filter, SortAsc } from 'lucide-react';

interface MysteryFiltersProps {
  filter: MysteryFilter;
  sort: MysterySort;
  onFilterChange: (filter: MysteryFilter) => void;
  onSortChange: (sort: MysterySort) => void;
  isAuthenticated: boolean;
}

const filterOptions: { value: MysteryFilter; label: string; requiresAuth?: boolean }[] = [
  { value: 'unsolved', label: 'Unsolved' },
  { value: 'solved', label: 'Solved' },
  { value: 'all', label: 'All' },
  { value: 'my_mysteries', label: 'My Mysteries', requiresAuth: true },
  { value: 'my_solves', label: 'My Solves', requiresAuth: true }
];

const sortOptions: { value: MysterySort; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'points', label: 'Highest Points' },
  { value: 'oldest', label: 'Oldest First' }
];

export function MysteryFilters({ 
  filter, 
  sort, 
  onFilterChange, 
  onSortChange,
  isAuthenticated 
}: MysteryFiltersProps) {
  const availableFilters = filterOptions.filter(
    opt => !opt.requiresAuth || isAuthenticated
  );

  return (
    <div className="flex flex-col sm:flex-row gap-3" role="group" aria-label="Mystery filters and sorting">
      {/* Filter buttons - mobile friendly */}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter mysteries">
        {availableFilters.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(option.value)}
            className="text-xs"
            role="radio"
            aria-checked={filter === option.value}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Sort dropdown */}
      <div className="flex items-center gap-2 ml-auto">
        <SortAsc className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Select value={sort} onValueChange={(value) => onSortChange(value as MysterySort)}>
          <SelectTrigger className="w-[140px] h-8 text-xs" aria-label="Sort by">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
