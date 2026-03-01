import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useShareMovie } from "@/hooks/useShareMovie";
import {
  getMovieShareUrl,
  getMovieShareText,
  getTwitterShareUrl,
  getWhatsAppShareUrl,
  getFacebookShareUrl,
} from "@/lib/share";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Share2,
  Link2,
  MessageCircle,
} from "lucide-react";

interface ShareMovieMenuProps {
  title: string;
  year?: number | null;
  /** Trigger element; defaults to a Share button */
  trigger?: React.ReactNode;
  /** Button variant when using default trigger */
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  /** Button size when using default trigger */
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  /** Optional class for the trigger */
  triggerClassName?: string;
}

const canNativeShare =
  typeof navigator !== "undefined" && Boolean(navigator.share);

export function ShareMovieMenu({
  title,
  year,
  trigger,
  variant = "outline",
  size = "sm",
  className,
  triggerClassName,
}: ShareMovieMenuProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { shareMovie, copyLink } = useShareMovie();
  const url = getMovieShareUrl(title, year);
  const text = getMovieShareText(title, year);

  const showCopiedToast = () => {
    toast({ title: t('share.linkCopied'), description: t('share.linkCopiedDesc') });
  };

  const showSharedToast = () => {
    toast({ title: t('share.shared'), description: t('share.sharedDesc') });
  };

  const handleNativeShare = async () => {
    const result = await shareMovie(title, year, {
      onSuccess: (r) => {
        if (r === "native") showSharedToast();
        if (r === "copy") showCopiedToast();
      },
    });
    if (result === "copy") showCopiedToast();
  };

  const handleCopyLink = async () => {
    await copyLink(title, year, {
      onSuccess: showCopiedToast,
      onError: () =>
        toast({
          title: t('share.copyFailed'),
          description: t('share.copyFailedDesc'),
          variant: "destructive",
        }),
    });
  };

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        {trigger ?? defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[12rem]">
        {canNativeShare && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="w-4 h-4 mr-2" />
            {t('share.shareVia')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleCopyLink}>
          <Link2 className="w-4 h-4 mr-2" />
          {t('share.copyLink')}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={getTwitterShareUrl(text, url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <span className="mr-2 inline-block w-4 h-4 text-[1rem] leading-none">𝕏</span>
            {t('share.shareOnX')}
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={getWhatsAppShareUrl(text, url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t('share.shareOnWhatsApp')}
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={getFacebookShareUrl(url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <span className="mr-2 inline-block w-4 h-4 text-[1rem] leading-none font-semibold">f</span>
            {t('share.shareOnFacebook')}
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
