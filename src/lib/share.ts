/** Share domain only — no localhost, no capacitor, clean URLs. */
const SHARE_DOMAIN = "https://www.cinemind.tech";

/** Clean slug: "Ted 2012" → "Ted-2012", no %20 or special chars. */
function movieSlug(title: string, year?: number | null): string {
  const clean = title
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "");
  return year != null ? `${clean}-${year}` : clean;
}

/** Share URL: only cinemind.tech, clear path e.g. /movie/Ted-2012 */
export function getMovieShareUrl(title: string, year?: number | null): string {
  return `${SHARE_DOMAIN}/movie/${movieSlug(title, year)}`;
}

/** Share text: clear and neat, no localhost/capacitor, domain only. */
export function getMovieShareText(title: string, year?: number | null): string {
  const film = year != null ? `${title} (${year})` : title;
  return `Check out ${film} on CineMind — App Store or cinemind.tech`;
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

/** Mystery share URL */
export function getMysteryShareUrl(mysteryId: string): string {
  return `${SHARE_DOMAIN}/mysteries/${mysteryId}`;
}

/** Mystery share text for challenging others */
export function getMysteryShareText(description: string): string {
  const shortDesc = description.length > 100 ? description.slice(0, 100) + '...' : description;
  return `🎬 Can you name this movie? "${shortDesc}" — Challenge accepted? 🔍`;
}

/** Reddit share URL */
export function getRedditShareUrl(title: string, url: string): string {
  return `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
}

/** Telegram share URL */
export function getTelegramShareUrl(text: string, url: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

/** LinkedIn share URL */
export function getLinkedInShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

/** Email share URL */
export function getEmailShareUrl(subject: string, body: string): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
