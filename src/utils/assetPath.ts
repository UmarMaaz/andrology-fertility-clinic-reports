/**
 * Normalizes asset URLs so they resolve properly both in web browsers
 * and under Electron's file:// protocol.
 */
export function fixAssetPath(url?: string): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return url.replace(/^\/+/, '');
}

