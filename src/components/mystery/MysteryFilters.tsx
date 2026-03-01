import { MysteryFilter, MysterySort } from '@/services/mysteryService';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { SortAsc } from 'lucide-react';

interface MysteryFiltersProps {
  filter: MysteryFilter;
  sort: MysterySort;
  onFilterChange: (filter: MysteryFilter) => void;
  onSortChange: (sort: MysterySort) => void;
  isAuthenticated: boolean;
}

const filterOptions: { value: MysteryFilter; label: string; shortLabel: string; requiresAuth?: boolean }[] = [
  { value: 'unsolved', label: 'Unsolved', shortLabel: 'Unsolved' },
  { value: 'solved', label: 'Solved', shortLabel: 'Solved' },
  { value: 'all', label: 'All', shortLabel: 'All' },
  { value: 'my_mysteries', label: 'My Mysteries', shortLabel: 'Mine', requiresAuth: true },
  { value: 'my_solves', label: 'My Solves', shortLabel: 'Solved', requiresAuth: true }
];

const sortOptions: { value: MysterySort; label: string }[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'popular', label: 'Popular' },
  { value: 'points', label: 'Points' },
  { value: 'oldest', label: 'Oldest' }
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
    <div className="flex items-center gap-2 sm:gap-3" role="group" aria-label="Mystery filters and sorting">
      {/* Filter buttons - horizontally scrollable on mobile */}
      <div 
        className="flex-1 overflow-x-auto scrollbar-hide -mx-1 px-1"
        role="radiogroup" 
        aria-label="Filter mysteries"
      >
        <div className="flex gap-1.5 sm:gap-2 min-w-max pb-1">
          {availableFilters.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange(option.value)}
              className="text-[11px] sm:text-xs h-8 px-2.5 sm:px-3 flex-shrink-0"
              role="radio"
              aria-checked={filter === option.value}
            >
              {/* Show short label on mobile, full label on larger screens */}
              <span className="sm:hidden">{option.shortLabel}</span>
              <span className="hidden sm:inline">{option.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Sort dropdown - fixed width, doesn't scroll */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <SortAsc className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground hidden sm:block" aria-hidden="true" />
        <Select value={sort} onValueChange={(value) => onSortChange(value as MysterySort)}>
          <SelectTrigger 
            className="w-[90px] sm:w-[110px] h-8 text-[11px] sm:text-xs" 
            aria-label="Sort by"
          >
            <SelectValue placeholder="Sort" />
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
