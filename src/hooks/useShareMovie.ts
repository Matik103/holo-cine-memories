import { useCallback } from "react";

function getMovieUrl(title: string, year?: number | null): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const slug = encodeURIComponent(year ? `${title} ${year}` : title);
  return `${base}/movie/${slug}`;
}

export function useShareMovie() {
  const shareMovie = useCallback(
    async (title: string, year?: number | null, options?: { onCopied?: () => void }) => {
      const url = getMovieUrl(title, year);
      const text = year ? `Check out ${title} (${year}) on CineMind!` : `Check out ${title} on CineMind!`;

      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: `${title}${year ? ` (${year})` : ""}`,
            text,
            url,
          });
          options?.onCopied?.();
          return;
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
        }
      }

      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        options?.onCopied?.();
      } catch {
        // fallback: open in new window or leave as is
        window.open(url, "_blank");
        options?.onCopied?.();
      }
    },
    []
  );

  return { shareMovie };
}
