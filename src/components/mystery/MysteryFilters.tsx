import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MysteryFilter, MysterySort } from '@/services/mysteryService';
import { Filter, SortAsc } from 'lucide-react';

interface MysteryFiltersProps {
  filter: MysteryFilter;
  sort: MysterySort;
  onFilterChange: (filter: MysteryFilter) => void;
  onSortChange: (sort: MysterySort) => void;
  isAuthenticated: boolean;
}

export function MysteryFilters({
  filter,
  sort,
  onFilterChange,
  onSortChange,
  isAuthenticated
}: MysteryFiltersProps) {
  const filters: { value: MysteryFilter; label: string; authRequired?: boolean }[] = [
    { value: 'unsolved', label: 'Unsolved' },
    { value: 'solved', label: 'Solved' },
    { value: 'my_mysteries', label: 'My Mysteries', authRequired: true },
    { value: 'my_solves', label: 'My Solves', authRequired: true },
    { value: 'all', label: 'All' }
  ];

  const sorts: { value: MysterySort; label: string }[] = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Viewed' },
    { value: 'points', label: 'Highest Points' },
    { value: 'oldest', label: 'Oldest' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {/* Filter tabs - mobile scrollable */}
      <div className="flex gap-1 overflow-x-auto pb-2 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0">
        {filters.map((f) => {
          if (f.authRequired && !isAuthenticated) return null;
          return (
            <Button
              key={f.value}
              variant={filter === f.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onFilterChange(f.value)}
              className="text-xs whitespace-nowrap flex-shrink-0"
            >
              {f.label}
            </Button>
          );
        })}
      </div>

      {/* Sort dropdown */}
      <div className="flex items-center gap-2 sm:ml-auto">
        <SortAsc className="h-4 w-4 text-muted-foreground" />
        <Select value={sort} onValueChange={(v) => onSortChange(v as MysterySort)}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sorts.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-xs">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
