const PUBLISHED_URL = 'https://theglobalattract.com';

function isNativePlatform(): boolean {
  try {
    // Check if Capacitor native bridge is available
    return !!(window as any).Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}

export function getRedirectUrl(path: string = ''): string {
  if (isNativePlatform()) {
    return `${PUBLISHED_URL}${path}`;
  }
  return `${window.location.origin}${path}`;
}
