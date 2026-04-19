import { API_ORIGIN } from '../config/api-base';

function joinOrigin(path: string): string {
  const normalized = path.replace(/\\/g, '/').replace(/\/+/g, '/');
  const withSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
  const joined = `${API_ORIGIN}${withSlash}`.replace(/([^:]\/)\/+/g, '$1');
  return normalizeHttpUrlIfPossible(joined);
}

/** Collapse duplicate `/` in path and encode each path segment (spaces, unicode, etc.). */
function normalizeHttpUrlIfPossible(url: string): string {
  const fixed = url.trim().replace(/\\/g, '/');
  if (!/^https?:\/\//i.test(fixed)) {
    return fixed.replace(/([^:]\/)\/+/g, '$1');
  }
  try {
    const u = new URL(fixed);
    u.pathname = u.pathname.replace(/\/+/g, '/');
    const parts = u.pathname.split('/').filter(Boolean);
    const encoded =
      '/' +
      parts
        .map(seg => {
          try {
            return encodeURIComponent(decodeURIComponent(seg));
          } catch {
            return encodeURIComponent(seg);
          }
        })
        .join('/');
    u.pathname = encoded.replace(/\/+/g, '/');
    return u.toString();
  } catch {
    return fixed.replace(/([^:]\/)\/+/g, '$1');
  }
}

/**
 * Build a safe `img` `src` from API `ImageUrl` / legacy `Picture`:
 * - Full `http`/`https`/`//` URLs: normalize `\` → `/`, collapse `//` in path, encode segments
 * - `data:` / `blob:` unchanged
 * - Relative paths / `UploadedPhotos/...` / `wwwroot/...` → resolved against {@link API_ORIGIN}
 * - Long base64-only strings (no file path cues) → `data:image/jpeg;base64,...`
 */
export function productPictureSrc(picture: string | null | undefined): string | null {
  if (picture == null || picture === '') {
    return null;
  }
  if (typeof picture !== 'string') {
    return null;
  }

  let t = picture.trim().replace(/\\/g, '/');
  if (!t) {
    return null;
  }

  const lower = t.toLowerCase();
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return normalizeHttpUrlIfPossible(t);
  }
  if (t.startsWith('//')) {
    return normalizeHttpUrlIfPossible(`https:${t}`);
  }
  if (lower.startsWith('data:') || lower.startsWith('blob:')) {
    return t;
  }

  if (lower.startsWith('wwwroot/')) {
    t = t.slice('wwwroot/'.length);
  }

  const looksLikeStaticFile =
    /\.(jpe?g|png|gif|webp|avif|bmp|svg)(\?|#|$)/i.test(t) ||
    /(^|\/)UploadedPhotos\//i.test(t) ||
    /^\.?\/?UploadedPhotos\//i.test(t);

  const probablyRawBase64 =
    t.length >= 120 &&
    !looksLikeStaticFile &&
    !t.startsWith('/') &&
    /^[A-Za-z0-9+/=\r\n]+$/.test(t);

  if (probablyRawBase64) {
    return `data:image/jpeg;base64,${t.replace(/\s/g, '')}`;
  }

  return joinOrigin(t);
}
