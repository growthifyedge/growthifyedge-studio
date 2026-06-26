/**
 * Helpers for turning arbitrary video URLs into safe, embeddable players.
 *
 * YouTube and Vimeo links are converted to their iframe-embed form so they can
 * play inside a modal. Anything else is treated as a plain link that should be
 * opened in a new browser tab.
 */

const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'];
const VIMEO_HOSTS = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'];

/** Returns an embeddable iframe URL for YouTube/Vimeo, or `null` otherwise. */
export function toEmbedUrl(rawUrl: string | undefined | null): string | null {
  if (!rawUrl) return null;
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();

  // --- YouTube -----------------------------------------------------------
  if (YOUTUBE_HOSTS.includes(host)) {
    let id = '';
    if (host === 'youtu.be') {
      id = url.pathname.slice(1);
    } else if (url.pathname.startsWith('/embed/')) {
      return url.toString(); // already an embed URL
    } else if (url.pathname.startsWith('/shorts/')) {
      id = url.pathname.split('/')[2] ?? '';
    } else {
      id = url.searchParams.get('v') ?? '';
    }
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  // --- Vimeo -------------------------------------------------------------
  if (VIMEO_HOSTS.includes(host)) {
    if (host === 'player.vimeo.com') return url.toString();
    const id = url.pathname.split('/').filter(Boolean)[0];
    return /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }

  return null;
}

/** True when the URL can be embedded in a modal player. */
export function isEmbeddable(url: string | undefined | null): boolean {
  return toEmbedUrl(url) !== null;
}
