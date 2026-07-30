export const DEFAULT_CLOUDFLARE_BEACON_TOKEN = 'a9408513fe144222b89e86151b26e70f';
export const DEFAULT_CLOUDFLARE_BEACON_SCRIPT_URL =
  'https://static.cloudflareinsights.com/beacon.min.js';

export function resolveCloudflareAnalytics({
  production,
  env = process.env,
}) {
  const token = env.PUBLIC_CLOUDFLARE_BEACON_TOKEN
    ?? (production ? DEFAULT_CLOUDFLARE_BEACON_TOKEN : '');
  if (!token) return null;
  return {
    token,
    scriptUrl: env.PUBLIC_CLOUDFLARE_BEACON_SCRIPT_URL
      ?? DEFAULT_CLOUDFLARE_BEACON_SCRIPT_URL,
  };
}

function escapeHtmlAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function cloudflareAnalyticsScriptTag({ token, scriptUrl }) {
  const beacon = escapeHtmlAttribute(JSON.stringify({ token }));
  const source = escapeHtmlAttribute(scriptUrl);
  return `<script defer data-cf-beacon="${beacon}" src="${source}"></script>`;
}
