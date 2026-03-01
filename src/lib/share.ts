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

/** Mystery share text for challenging others - short version for Twitter/X */
export function getMysteryShareText(description: string): string {
  const shortDesc = description.length > 80 ? description.slice(0, 80) + '...' : description;
  return `🎬 Can you name this movie?\n\n"${shortDesc}"\n\nChallenge accepted? 🔍`;
}

/** Mystery share text - full structured version for WhatsApp, Telegram, Copy */
export function getMysteryShareTextFull(description: string): string {
  const shortDesc = description.length > 150 ? description.slice(0, 150) + '...' : description;
  return `🎬 *MOVIE MYSTERY CHALLENGE* 🎬

Can you name this movie?

📝 *The Clue:*
"${shortDesc}"

🏆 Think you know it? Prove it!

🔍 Solve it on CineMind`;
}

/** Reddit share URL - with engaging title */
export function getRedditShareUrl(title: string, url: string): string {
  return `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
}

/** Reddit mystery title */
export function getMysteryRedditTitle(description: string): string {
  const shortDesc = description.length > 60 ? description.slice(0, 60) + '...' : description;
  return `[Movie Challenge] Can you name this film? "${shortDesc}"`;
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

/** Email body for mystery - well formatted */
export function getMysteryEmailBody(description: string, url: string): string {
  const shortDesc = description.length > 200 ? description.slice(0, 200) + '...' : description;
  return `Hey!

I found this movie mystery and I bet you can't solve it! 🎬

THE CLUE:
"${shortDesc}"

Think you know what movie this is?

Click here to solve it: ${url}

Good luck! 🔍

- Sent from CineMind`;
}
