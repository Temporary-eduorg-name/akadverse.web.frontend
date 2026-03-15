const DEFAULT_LIVE_APP_URL = "https://akadverse-web-frontend.vercel.app";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function getAppBaseUrl(preferLive = true): string {
  const liveUrl = process.env.NEXT_LIVE_APP_URL?.trim();
  const publicUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  const resolved = preferLive
    ? liveUrl || publicUrl || DEFAULT_LIVE_APP_URL
    : publicUrl || liveUrl || DEFAULT_LIVE_APP_URL;

  return normalizeBaseUrl(resolved);
}

export function buildAppUrl(path: string, preferLive = true): string {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${getAppBaseUrl(preferLive)}${safePath}`;
}
