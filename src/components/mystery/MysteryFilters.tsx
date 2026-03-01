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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
  const filterOptions: { value: MysteryFilter; label: string; shortLabel: string; requiresAuth?: boolean }[] = [
    { value: 'unsolved', label: t('mystery.unsolved'), shortLabel: t('mystery.unsolved') },
    { value: 'solved', label: t('mystery.solved'), shortLabel: t('mystery.solved') },
    { value: 'all', label: t('mystery.all'), shortLabel: t('mystery.all') },
    { value: 'my_mysteries', label: t('mystery.myMysteries'), shortLabel: t('mystery.myMysteryShort'), requiresAuth: true },
    { value: 'my_solves', label: t('mystery.mySolves'), shortLabel: t('mystery.mySolves'), requiresAuth: true }
  ];

  const sortOptions: { value: MysterySort; label: string }[] = [
    { value: 'recent', label: t('mystery.sort.recent') },
    { value: 'popular', label: t('mystery.sort.popular') },
    { value: 'points', label: t('mystery.sort.points') },
    { value: 'oldest', label: t('mystery.sort.oldest') }
  ];
  
  const availableFilters = filterOptions.filter(
    opt => !opt.requiresAuth || isAuthenticated
  );

  return (
    <div className="flex items-center gap-2 sm:gap-3" role="group" aria-label={t('mystery.collectiveMemory')}>
      {/* Filter buttons - horizontally scrollable on mobile */}
      <div 
        className="flex-1 overflow-x-auto scrollbar-hide -mx-1 px-1"
        role="radiogroup" 
        aria-label={t('mystery.collectiveMemory')}
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
            aria-label={t('mystery.sort.recent')}
          >
            <SelectValue placeholder={t('mystery.sort.recent')} />
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
