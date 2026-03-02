import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search, Sparkles } from "lucide-react";
import { scrollInputIntoView } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { sanitizeSearchQuery } from "@/lib/sanitize";

interface MemorySearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export const MemorySearch = ({ onSearch, isLoading }: MemorySearchProps) => {
  const [query, setQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();

  const handleInputFocus = useCallback(() => {
    scrollInputIntoView(textareaRef.current);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedQuery = sanitizeSearchQuery(query);
    if (sanitizedQuery) {
      onSearch(sanitizedQuery);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-4">
      {/* Floating Memory Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-particle absolute top-20 left-20 w-2 h-2 bg-primary rounded-full opacity-40" style={{ animationDelay: '0s' }}></div>
        <div className="floating-particle absolute top-40 right-32 w-1 h-1 bg-accent rounded-full opacity-60" style={{ animationDelay: '2s' }}></div>
        <div className="floating-particle absolute bottom-32 left-16 w-3 h-3 bg-primary rounded-full opacity-30" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main Memory Input */}
      <div className="neural-card rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-accent neural-glow">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent px-2">
            {t('search.whatMovie')}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base px-4">
            {t('search.describeAny')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-3">
            <Textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleInputFocus}
              placeholder={t('search.placeholder')}
              className="memory-input min-h-24 text-lg resize-none rounded-xl"
              disabled={isLoading}
              aria-label={t('search.describeAny')}
              aria-describedby="search-hint"
            />
            <p id="search-hint" className="sr-only">
              Enter any details you remember about the movie - scenes, quotes, actors, or plot points
            </p>
            
            <Button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="neural-button w-full h-12 rounded-xl text-sm sm:text-base"
              aria-label={t('search.recallMovie')}
              aria-busy={isLoading}
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">{isLoading ? t('search.searchingMemory') : t('search.recallMovie')}</span>
              <span className="sm:hidden">{isLoading ? t('search.searching') : t('search.button')}</span>
            </Button>
          </div>
        </form>

        {/* Quick Suggestions */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 text-center">{t('search.tryExamples')}</p>
          <div className="grid grid-cols-2 gap-2 w-full">
            {[
              { key: 'search.example1', fallback: 'Spinning dreams' },
              { key: 'search.example2', fallback: 'Robot loves human' },
              { key: 'search.example3', fallback: 'Time loop same day' },
              { key: 'search.example4', fallback: 'Talking toys come alive' }
            ].map((example) => (
              <Button
                key={example.key}
                variant="ghost"
                size="sm"
                onClick={() => setQuery(t(example.key) || example.fallback)}
                className="text-[10px] sm:text-xs bg-secondary/30 hover:bg-secondary/60 rounded-full px-2 py-1.5 h-auto text-center leading-tight overflow-hidden text-ellipsis line-clamp-2 max-w-full"
                disabled={isLoading}
              >
                {t(example.key) || example.fallback}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};