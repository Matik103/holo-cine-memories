import { useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import {
  getMovieShareUrl,
  getMovieShareText,
  getMovieShareTitle,
} from "@/lib/share";

export type ShareResult = "native" | "copy" | "open" | "aborted";

export function useShareMovie() {
  const shareMovie = useCallback(
    async (
      title: string,
      year?: number | null,
      options?: {
        onSuccess?: (result: ShareResult) => void;
        onError?: () => void;
      }
    ): Promise<ShareResult> => {
      const url = getMovieShareUrl(title, year);
      const text = getMovieShareText(title, year);
      const shareTitle = getMovieShareTitle(title, year);

      // Capacitor native share (iOS / Android) – native share sheet
      if (Capacitor.isNativePlatform()) {
        try {
          const { Share } = await import("@capacitor/share");
          const canShare = await Share.canShare();
          if (canShare?.value) {
            await Share.share({
              title: shareTitle,
              text,
              url,
              dialogTitle: "Share movie",
            });
            options?.onSuccess?.("native");
            return "native";
          }
        } catch (err) {
          if ((err as Error).name === "AbortError" || (err as Error).message?.includes("cancel")) {
            options?.onSuccess?.("aborted");
            return "aborted";
          }
          // Fall through to clipboard
        }
      }

      // Web: Web Share API when available
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text,
            url,
          });
          options?.onSuccess?.("native");
          return "native";
        } catch (err) {
          if ((err as Error).name === "AbortError") {
            options?.onSuccess?.("aborted");
            return "aborted";
          }
        }
      }

      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        options?.onSuccess?.("copy");
        return "copy";
      } catch {
        try {
          window.open(url, "_blank", "noopener,noreferrer");
          options?.onSuccess?.("open");
          return "open";
        } catch {
          options?.onError?.();
          return "copy";
        }
      }
    },
    []
  );

  const copyLink = useCallback(
    async (
      title: string,
      year?: number | null,
      options?: { onSuccess?: () => void; onError?: () => void }
    ): Promise<boolean> => {
      const url = getMovieShareUrl(title, year);
      const text = getMovieShareText(title, year);
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        options?.onSuccess?.();
        return true;
      } catch {
        try {
          await navigator.clipboard.writeText(url);
          options?.onSuccess?.();
          return true;
        } catch {
          options?.onError?.();
          return false;
        }
      }
    },
    []
  );

  return {
    shareMovie,
    copyLink,
    getMovieShareUrl,
    getMovieShareText,
    getMovieShareTitle,
  };
}
