import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  getMysteryShareUrl,
  getTwitterShareUrl,
  getWhatsAppShareUrl,
  getFacebookShareUrl,
  getRedditShareUrl,
  getTelegramShareUrl,
  getEmailShareUrl,
} from "@/lib/share";
import {
  Share2,
  Link2,
  MessageCircle,
  Mail,
  Send,
  Globe,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { translationService } from "@/services/translationService";

// Share target languages - common languages for social media
const SHARE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ht', name: 'Kreyòl', flag: '🇭🇹' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
];

// English share text templates (used as base for translation)
const SHARE_TEMPLATES = {
  movieMystery: 'Movie Mystery',
  canYouHelp: 'Can you help?',
  canYouHelpSolve: 'Can you help solve this?',
  answerOnCineMind: 'Answer on CineMind',
  helpPrefix: '[Help]',
  emailGreeting: 'Hey!',
  emailIntro: 'I came across this movie mystery and thought you might know the answer:',
  sentFromCineMind: 'Sent from CineMind',
  commentBelow: 'Comment below!',
  // Hashtag words (will be converted to hashtags after translation)
  tagMovieMystery: 'MovieMystery',
  tagMovies: 'Movies',
  tagFilm: 'Film',
  tagHelpMeFind: 'HelpMeFind',
  tagFilmTok: 'FilmTok',
};

interface ShareMysteryMenuProps {
  mysteryId: string;
  description: string;
  trigger?: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  triggerClassName?: string;
}

const canNativeShare =
  typeof navigator !== "undefined" && Boolean(navigator.share);

export function ShareMysteryMenu({
  mysteryId,
  description,
  trigger,
  variant = "outline",
  size = "sm",
  className,
  triggerClassName,
}: ShareMysteryMenuProps) {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const url = getMysteryShareUrl(mysteryId);
  
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Translate text to target language using API
  const translateToLanguage = async (text: string, targetLang: string): Promise<string> => {
    if (targetLang === 'en') {
      // If target is English, we might need to translate FROM user's language
      // Use translation service to translate to English
      try {
        return await translationService.translate(text, 'en');
      } catch {
        return text;
      }
    }
    try {
      return await translationService.translate(text, targetLang);
    } catch {
      return text;
    }
  };
  
  // Get translated share templates for a target language
  const getTranslatedTemplates = async (targetLang: string) => {
    if (targetLang === 'en') {
      return SHARE_TEMPLATES;
    }
    
    const translations: Record<string, string> = {};
    const keys = Object.keys(SHARE_TEMPLATES) as (keyof typeof SHARE_TEMPLATES)[];
    
    await Promise.all(
      keys.map(async (key) => {
        try {
          translations[key] = await translationService.translate(SHARE_TEMPLATES[key], targetLang);
        } catch {
          translations[key] = SHARE_TEMPLATES[key];
        }
      })
    );
    
    return translations as typeof SHARE_TEMPLATES;
  };
  
  // Convert translated word to hashtag (remove spaces, special chars)
  const toHashtag = (text: string): string => {
    return '#' + text.replace(/\s+/g, '').replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/g, '');
  };
  
  // Generate share content for a specific target language
  const generateShareContent = async (targetLang: string) => {
    setIsTranslating(true);
    
    try {
      // Translate description and templates in parallel
      const [translatedDesc, templates] = await Promise.all([
        translateToLanguage(description, targetLang),
        getTranslatedTemplates(targetLang),
      ]);
      
      const getShortDesc = (maxLen: number) => {
        return translatedDesc.length > maxLen 
          ? translatedDesc.slice(0, maxLen) + '...' 
          : translatedDesc;
      };
      
      // Generate translated hashtags
      const hashtags = {
        movieMystery: toHashtag(templates.tagMovieMystery),
        movies: toHashtag(templates.tagMovies),
        film: toHashtag(templates.tagFilm),
        helpMeFind: toHashtag(templates.tagHelpMeFind),
        filmTok: toHashtag(templates.tagFilmTok),
        cineMind: '#CineMind', // Keep brand name
      };
      
      // Instagram hashtags string
      const instagramHashtags = `${hashtags.movieMystery} ${hashtags.cineMind} ${hashtags.movies} ${hashtags.film} ${hashtags.helpMeFind}`;
      
      // TikTok hashtags string
      const tiktokHashtags = `${hashtags.movieMystery} ${hashtags.cineMind} ${hashtags.movies} ${hashtags.filmTok} ${hashtags.helpMeFind}`;
      
      return {
        description: translatedDesc,
        shortDesc120: getShortDesc(120),
        shortDesc150: getShortDesc(150),
        shortDesc250: getShortDesc(250),
        shortDesc300: getShortDesc(300),
        shortDesc80: getShortDesc(80),
        templates,
        hashtags,
        instagramHashtags,
        tiktokHashtags,
      };
    } finally {
      setIsTranslating(false);
    }
  };

  const handleNativeShare = async (targetLang: string) => {
    try {
      const content = await generateShareContent(targetLang);
      const shareTitle = `🎬 ${content.templates.movieMystery}`;
      const fullText = `🎬 *${content.templates.movieMystery}* 🎬\n\n${content.shortDesc250}\n\n${content.templates.canYouHelpSolve}\n\n🔍 ${content.templates.answerOnCineMind}`;
      
      await navigator.share({
        title: shareTitle,
        text: fullText,
        url: url,
      });
      toast({ title: t('share.shared'), description: t('share.sharedDesc') });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        handleCopyLink(targetLang);
      }
    }
  };

  const handleCopyLink = async (targetLang: string) => {
    try {
      const content = await generateShareContent(targetLang);
      const fullText = `🎬 *${content.templates.movieMystery}* 🎬\n\n${content.shortDesc250}\n\n${content.templates.canYouHelpSolve}\n\n🔍 ${content.templates.answerOnCineMind}`;
      const copyText = `${fullText}\n\n👉 ${url}`;
      await navigator.clipboard.writeText(copyText);
      toast({ 
        title: t('share.linkCopied'), 
        description: t('share.linkCopiedDesc')
      });
    } catch {
      toast({
        title: t('share.copyFailed'),
        description: t('share.copyFailedDesc'),
        variant: "destructive",
      });
    }
  };

  const handleInstagramShare = async (targetLang: string) => {
    try {
      const content = await generateShareContent(targetLang);
      const instagramText = `🎬 ${content.templates.movieMystery} 🎬

${content.shortDesc150}

${content.templates.canYouHelp} 🔍

👉 ${url}

${content.instagramHashtags}`;
      await navigator.clipboard.writeText(instagramText);
      toast({
        title: t('share.readyForInstagram'),
        description: t('share.readyForInstagramDesc'),
      });
    } catch {
      toast({
        title: t('share.copyFailed'),
        description: t('share.copyFailedDesc'),
        variant: "destructive",
      });
    }
  };

  const handleTikTokShare = async (targetLang: string) => {
    try {
      const content = await generateShareContent(targetLang);
      const tiktokText = `🎬 ${content.templates.movieMystery} 🎬

${content.shortDesc120}

${content.templates.canYouHelp} ${content.templates.commentBelow} 👇

👉 ${url}

${content.tiktokHashtags}`;
      await navigator.clipboard.writeText(tiktokText);
      toast({
        title: t('share.readyForTikTok'),
        description: t('share.readyForTikTokDesc'),
      });
    } catch {
      toast({
        title: t('share.copyFailed'),
        description: t('share.copyFailedDesc'),
        variant: "destructive",
      });
    }
  };
  
  const handleTwitterShare = async (targetLang: string) => {
    const content = await generateShareContent(targetLang);
    const shortText = `🎬 ${content.templates.movieMystery}\n\n${content.shortDesc120}\n\n${content.templates.canYouHelp} 🔍`;
    window.open(getTwitterShareUrl(shortText, url), '_blank');
  };
  
  const handleWhatsAppShare = async (targetLang: string) => {
    const content = await generateShareContent(targetLang);
    const fullText = `🎬 *${content.templates.movieMystery}* 🎬\n\n${content.shortDesc250}\n\n${content.templates.canYouHelpSolve}\n\n🔍 ${content.templates.answerOnCineMind}`;
    window.open(getWhatsAppShareUrl(fullText, url), '_blank');
  };
  
  const handleTelegramShare = async (targetLang: string) => {
    const content = await generateShareContent(targetLang);
    const fullText = `🎬 *${content.templates.movieMystery}* 🎬\n\n${content.shortDesc250}\n\n${content.templates.canYouHelpSolve}\n\n🔍 ${content.templates.answerOnCineMind}`;
    window.open(getTelegramShareUrl(fullText, url), '_blank');
  };
  
  const handleRedditShare = async (targetLang: string) => {
    const content = await generateShareContent(targetLang);
    const redditTitle = `${content.templates.helpPrefix} ${content.shortDesc80}`;
    window.open(getRedditShareUrl(redditTitle, url), '_blank');
  };
  
  const handleEmailShare = async (targetLang: string) => {
    const content = await generateShareContent(targetLang);
    const shareTitle = `🎬 ${content.templates.movieMystery}`;
    const emailBody = `${content.templates.emailGreeting}\n\n${content.templates.emailIntro}\n\n${content.shortDesc300}\n\n${content.templates.canYouHelp}\n\n${url}\n\n- ${content.templates.sentFromCineMind}`;
    window.location.href = getEmailShareUrl(shareTitle, emailBody);
  };
  
  // Language selector submenu component
  const LanguageSubMenu = ({ 
    icon, 
    label, 
    onSelect 
  }: { 
    icon: React.ReactNode; 
    label: string; 
    onSelect: (lang: string) => void;
  }) => (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="flex items-center">
        {icon}
        {label}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
          {SHARE_LANGUAGES.map((lang) => (
            <DropdownMenuItem 
              key={lang.code} 
              onClick={() => onSelect(lang.code)}
              disabled={isTranslating}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
              {isTranslating && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );

  const defaultTrigger = (
    <Button
      variant={variant}
      size={size}
      className={triggerClassName}
      aria-label={t('share.share')}
    >
      <Share2 className="w-4 h-4 mr-2" />
      {t('share.share')}
    </Button>
  );
  
  // Icons for each platform
  const InstagramIcon = () => (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
  
  const FacebookIcon = () => (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
  
  const TikTokIcon = () => (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  );
  
  const XIcon = () => (
    <span className="mr-2 inline-block w-4 h-4 text-[1rem] leading-none font-bold">𝕏</span>
  );
  
  const RedditIcon = () => (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        {trigger ?? defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[14rem]">
        {canNativeShare && (
          <LanguageSubMenu
            icon={<Share2 className="w-4 h-4 mr-2" />}
            label={t('share.shareVia')}
            onSelect={handleNativeShare}
          />
        )}
        <LanguageSubMenu
          icon={<Link2 className="w-4 h-4 mr-2" />}
          label={t('share.copyChallengeLink')}
          onSelect={handleCopyLink}
        />

        <DropdownMenuSeparator />

        {/* Major Social Platforms */}
        <LanguageSubMenu
          icon={<InstagramIcon />}
          label={t('share.shareOnInstagram')}
          onSelect={handleInstagramShare}
        />

        <DropdownMenuItem asChild>
          <a
            href={getFacebookShareUrl(url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <FacebookIcon />
            {t('share.shareOnFacebook')}
          </a>
        </DropdownMenuItem>

        <LanguageSubMenu
          icon={<TikTokIcon />}
          label={t('share.shareOnTikTok')}
          onSelect={handleTikTokShare}
        />

        <DropdownMenuSeparator />

        {/* Messaging Apps */}
        <LanguageSubMenu
          icon={<XIcon />}
          label={t('share.shareOnX')}
          onSelect={handleTwitterShare}
        />

        <LanguageSubMenu
          icon={<MessageCircle className="w-4 h-4 mr-2" />}
          label={t('share.shareOnWhatsApp')}
          onSelect={handleWhatsAppShare}
        />

        <LanguageSubMenu
          icon={<Send className="w-4 h-4 mr-2" />}
          label={t('share.shareOnTelegram')}
          onSelect={handleTelegramShare}
        />

        <LanguageSubMenu
          icon={<RedditIcon />}
          label={t('share.shareOnReddit')}
          onSelect={handleRedditShare}
        />

        <DropdownMenuSeparator />

        <LanguageSubMenu
          icon={<Mail className="w-4 h-4 mr-2" />}
          label={t('share.shareViaEmail')}
          onSelect={handleEmailShare}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
