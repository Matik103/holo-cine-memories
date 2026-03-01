import { useState, useEffect } from 'react';
import { Globe, Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const LANGUAGE_SELECTED_KEY = 'cinemind_language_selected';

const POPULAR_LANGUAGES = ['en', 'id', 'ms', 'zh', 'es', 'pt', 'hi', 'ar', 'ja', 'ko', 'fr', 'de'];

export function LanguageSelectionModal() {
  const { currentLanguage, changeLanguage, supportedLanguages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(currentLanguage);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const hasSelected = localStorage.getItem(LANGUAGE_SELECTED_KEY);
    if (!hasSelected) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const popularLanguages = supportedLanguages.filter(l => POPULAR_LANGUAGES.includes(l.code));

  const filteredLanguages = searchQuery
    ? supportedLanguages.filter(
        lang =>
          lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : popularLanguages;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await changeLanguage(selectedLang);
      localStorage.setItem(LANGUAGE_SELECTED_KEY, 'true');
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const LanguageButton = ({ lang }: { lang: typeof supportedLanguages[0] }) => (
    <button
      onClick={() => setSelectedLang(lang.code)}
      className={cn(
        'w-full text-left p-3 rounded-lg border-2 transition-all',
        selectedLang === lang.code
          ? 'border-primary bg-primary/10'
          : 'border-transparent bg-muted/50 hover:bg-muted'
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{lang.nativeName}</p>
          <p className="text-xs text-muted-foreground">{lang.name}</p>
        </div>
        {selectedLang === lang.code && (
          <Check className="w-5 h-5 text-primary" />
        )}
      </div>
    </button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">Choose Your Language</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Select your preferred language for CineMind
          </p>
        </DialogHeader>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[280px] pr-2">
          <div className="grid grid-cols-2 gap-2">
            {filteredLanguages.map((lang) => (
              <LanguageButton key={lang.code} lang={lang} />
            ))}
          </div>
          
          {filteredLanguages.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No languages found
            </p>
          )}
        </ScrollArea>

        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          className="w-full mt-4"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Loading...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Continue with {supportedLanguages.find(l => l.code === selectedLang)?.nativeName}
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
