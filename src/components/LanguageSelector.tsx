import { useState } from 'react';
import { Globe, Check, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'dialog' | 'compact';
  className?: string;
}

export function LanguageSelector({ variant = 'dropdown', className }: LanguageSelectorProps) {
  const { t, currentLanguage, currentLanguageInfo, changeLanguage, supportedLanguages } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredLanguages = supportedLanguages.filter(
    lang =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Language change is now instant - no loading states needed
  const handleSelectLanguage = (code: string) => {
    if (code !== currentLanguage) {
      changeLanguage(code);
    }
    setDialogOpen(false);
    setSearchQuery('');
  };

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={cn('h-9 w-9 relative', className)}>
            <Globe className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 text-xs leading-none">
              {currentLanguageInfo.flag}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="max-h-[300px] overflow-y-auto mt-2">
          {supportedLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-base">{lang.flag}</span>
              <span className="flex-1">{lang.nativeName}</span>
              {currentLanguage === lang.code && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'dialog') {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className={cn('gap-2', className)}>
            <span className="text-base">{currentLanguageInfo.flag}</span>
            <span>{currentLanguageInfo.nativeName}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('language.selectTitle')}</DialogTitle>
          </DialogHeader>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('language.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <ScrollArea className="h-[300px] pr-4">
            <div className="grid gap-1">
              {filteredLanguages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={currentLanguage === lang.code ? 'secondary' : 'ghost'}
                  className="w-full justify-between h-auto py-3"
                  onClick={() => handleSelectLanguage(lang.code)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{lang.nativeName}</span>
                      <span className="text-xs text-muted-foreground">{lang.name}</span>
                    </div>
                  </div>
                  {currentLanguage === lang.code && <Check className="h-4 w-4" />}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn('gap-2', className)}>
          <span className="text-base">{currentLanguageInfo.flag}</span>
          <span className="hidden sm:inline">{currentLanguageInfo.nativeName}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <ScrollArea className="h-[300px]">
          {supportedLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className="flex items-center justify-between cursor-pointer gap-2"
            >
              <span className="text-base">{lang.flag}</span>
              <div className="flex flex-col flex-1">
                <span>{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">{lang.name}</span>
              </div>
              {currentLanguage === lang.code && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
