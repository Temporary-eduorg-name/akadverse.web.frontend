
const DEFAULT_LIVE_APP_URL_ALT = "https://akadverse.vercel.app";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function getAppBaseUrl(preferLive = true): string {
  const liveUrl = process.env.NEXT_LIVE_APP_URL_ALT?.trim();
  const publicUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();


  const resolved = preferLive
    ? liveUrl || publicUrl || DEFAULT_LIVE_APP_URL_ALT
    : "http://localhost:3000"

  return normalizeBaseUrl(resolved);
}

export function buildAppUrl(path: string, preferLive = true): string {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  console.log(`${getAppBaseUrl(preferLive)}${safePath}`)
  return `${getAppBaseUrl(preferLive)}${safePath}`;
}
