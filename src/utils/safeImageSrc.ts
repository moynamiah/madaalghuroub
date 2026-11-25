/**
 * Strict image source sanitizer for local assets, HTTPS URLs, and raster base64 data URLs.
 * Blocks javascript:, vbscript:, file:, http:, blob:, scheme-relative (//),
 * SVG/HTML data URLs, control characters, path traversal, and credentialed URLs.
 */

export const MAX_IMAGE_DATA_URL_LENGTH = 500_000;
export const MAX_IMAGE_URL_LENGTH = 2_048;

const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F]/;
const RASTER_DATA_URL_REGEX = /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/i;
const SAFE_RELATIVE_PATH_REGEX = /^\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]+$/;

export function safeImageSrc(
  value: unknown,
  maxDataUrlLength: number = MAX_IMAGE_DATA_URL_LENGTH
): string {
  if (typeof value !== 'string') {
    return '';
  }

  // Reject any ASCII control characters (including CR, LF, NUL, TAB) before trimming
  if (CONTROL_CHAR_REGEX.test(value)) {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  // 1. Strict raster base64 data URLs (blocks data:image/svg+xml, data:text/html, etc.)
  if (trimmed.toLowerCase().startsWith('data:')) {
    if (trimmed.length > maxDataUrlLength) {
      return '';
    }
    return RASTER_DATA_URL_REGEX.test(trimmed) ? trimmed : '';
  }

  // 2. Single-leading-slash relative local paths (blocks scheme-relative //evil.com and .. traversal)
  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('//') || trimmed.includes('..') || trimmed.includes('\\')) {
      return '';
    }
    if (trimmed.length > MAX_IMAGE_URL_LENGTH) {
      return '';
    }
    return SAFE_RELATIVE_PATH_REGEX.test(trimmed) ? trimmed : '';
  }

  // 3. Strict HTTPS URLs without embedded credentials
  if (/^https:\/\//i.test(trimmed)) {
    if (trimmed.length > MAX_IMAGE_URL_LENGTH) {
      return '';
    }
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'https:') {
        return '';
      }
      if (!parsed.hostname || parsed.username || parsed.password) {
        return '';
      }
      return trimmed;
    } catch {
      return '';
    }
  }

  return '';
}
