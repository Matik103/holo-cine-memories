/** Canonical share URL for a movie. */
export function getMovieShareUrl(title: string, year?: number | null): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const slug = encodeURIComponent(year != null ? `${title} ${year}` : title);
  return `${base}/movie/${slug}`;
}

export function getMovieShareText(title: string, year?: number | null): string {
  return year != null
    ? `Check out ${title} (${year}) on CineMind!`
    : `Check out ${title} on CineMind!`;
}

export function getMovieShareTitle(title: string, year?: number | null): string {
  return year != null ? `${title} (${year})` : title;
}

export function getTwitterShareUrl(text: string, url: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text} ${url}`)}`;
}

export function getWhatsAppShareUrl(text: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
}

export function getFacebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}
