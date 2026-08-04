import {
  DEFAULT_YOUTUBE_CHANNEL_ID,
  DEFAULT_YOUTUBE_CHANNEL_URL,
} from '@/constants/youtube';
import connectDB from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';

function extractChannelId(url) {
  if (!url) return '';
  const match = url.match(/channel\/(UC[\w-]+)/);
  return match?.[1] || '';
}

const EMPTY_AD_SLOT = {
  adsenseSlot: '',
  imageUrl: '',
  linkUrl: '',
  alt: '',
};

const DEFAULTS = {
  commentsEnabled: false,
  appDownloadEnabled: false,
  youtubeChannelId: DEFAULT_YOUTUBE_CHANNEL_ID,
  youtubeChannelUrl: DEFAULT_YOUTUBE_CHANNEL_URL,
  googleAnalyticsId: '',
  googleAnalyticsPropertyId: '',
  adsEnabled: true,
  adsenseClientId: '',
  adSlotHeader: { ...EMPTY_AD_SLOT },
  adSlotSidebar: { ...EMPTY_AD_SLOT },
  adSlotInArticle: { ...EMPTY_AD_SLOT },
  adSlotAfterArticle: { ...EMPTY_AD_SLOT },
};

function normalizeAdSlot(slot) {
  return {
    adsenseSlot: (slot?.adsenseSlot || '').trim(),
    imageUrl: (slot?.imageUrl || '').trim(),
    linkUrl: (slot?.linkUrl || '').trim(),
    alt: (slot?.alt || '').trim(),
  };
}

function formatPublicSettings(settings) {
  return {
    commentsEnabled: settings.commentsEnabled ?? DEFAULTS.commentsEnabled,
    appDownloadEnabled: settings.appDownloadEnabled ?? DEFAULTS.appDownloadEnabled,
    youtubeChannelId: settings.youtubeChannelId || DEFAULTS.youtubeChannelId,
    youtubeChannelUrl: settings.youtubeChannelUrl || DEFAULTS.youtubeChannelUrl,
    youtubeConnected: Boolean(settings.youtubeRefreshToken),
    googleAnalyticsId:
      settings.googleAnalyticsId ||
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
      process.env.GA_MEASUREMENT_ID ||
      DEFAULTS.googleAnalyticsId,
    googleAnalyticsPropertyId:
      settings.googleAnalyticsPropertyId ||
      process.env.GA_PROPERTY_ID ||
      process.env.GOOGLE_ANALYTICS_PROPERTY_ID ||
      DEFAULTS.googleAnalyticsPropertyId,
    adsEnabled: settings.adsEnabled === true,
    adsenseClientId:
      (settings.adsenseClientId || '').trim() ||
      process.env.NEXT_PUBLIC_ADSENSE_CLIENT ||
      process.env.ADSENSE_CLIENT_ID ||
      '',
    adSlotHeader: normalizeAdSlot(settings.adSlotHeader),
    adSlotSidebar: normalizeAdSlot(settings.adSlotSidebar),
    adSlotInArticle: normalizeAdSlot(settings.adSlotInArticle),
    adSlotAfterArticle: normalizeAdSlot(settings.adSlotAfterArticle),
  };
}

const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
].join(' ');

function getAppUrl() {
  return (
    process.env.GOOGLE_REDIRECT_URI?.replace(/\/api\/youtube\/callback\/?$/, '') ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

/** Resolve OAuth redirect URI from incoming request (works behind nginx / www). */
export function getYouTubeRedirectUri(request) {
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI.replace(/\/$/, '');
  }

  if (request) {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
    if (forwardedHost) {
      const host = forwardedHost.split(',')[0].trim();
      return `${forwardedProto}://${host}/api/youtube/callback`;
    }
    try {
      return `${new URL(request.url).origin}/api/youtube/callback`;
    } catch {
      // fall through
    }
  }

  return `${getAppUrl()}/api/youtube/callback`;
}

export function getYouTubeRedirectUrisForConsole() {
  const base = getAppUrl();
  const uris = new Set([`${base}/api/youtube/callback`]);
  try {
    const { hostname, protocol } = new URL(base);
    if (hostname.startsWith('www.')) {
      uris.add(`${protocol}//${hostname.slice(4)}/api/youtube/callback`);
    } else if (!hostname.includes('localhost')) {
      uris.add(`${protocol}//www.${hostname}/api/youtube/callback`);
    }
  } catch {
    // ignore
  }
  uris.add('http://localhost:3000/api/youtube/callback');
  return [...uris];
}

export function getYouTubeJavaScriptOrigins() {
  const origins = new Set();
  try {
    const base = getAppUrl();
    const { origin } = new URL(base);
    origins.add(origin);
    const { hostname, protocol } = new URL(base);
    if (hostname.startsWith('www.')) {
      origins.add(`${protocol}//${hostname.slice(4)}`);
    } else if (!hostname.includes('localhost')) {
      origins.add(`${protocol}//www.${hostname}`);
    }
  } catch {
    // ignore
  }
  origins.add('http://localhost:3000');
  return [...origins];
}

export function isYouTubeApiConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
}

export function getYouTubeOAuthUrl(state, redirectUri) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirect_uri = redirectUri || `${getAppUrl()}/api/youtube/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri,
    response_type: 'code',
    scope: YOUTUBE_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeYouTubeCode(code, redirectUri) {
  const redirect_uri = redirectUri || `${getAppUrl()}/api/youtube/callback`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri,
      grant_type: 'authorization_code',
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'OAuth token exchange failed');
  }
  return data;
}

export async function refreshYouTubeAccessToken(refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'Token refresh failed');
  }
  return data.access_token;
}

export async function initYouTubeResumableUpload({
  accessToken,
  title,
  description = '',
  privacyStatus = 'public',
  mimeType,
  fileSize,
}) {
  const res = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': mimeType,
        'X-Upload-Content-Length': String(fileSize),
      },
      body: JSON.stringify({
        snippet: {
          title: title.slice(0, 100),
          description: description.slice(0, 5000),
          categoryId: '25',
        },
        status: { privacyStatus },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'YouTube upload init failed');
  }

  const uploadUrl = res.headers.get('location');
  if (!uploadUrl) throw new Error('YouTube upload URL not returned');
  return uploadUrl;
}

export async function getSiteSettings() {
  await connectDB();
  let settings = await SiteSettings.findOne({ key: 'site' }).lean();
  if (!settings) {
    const created = await SiteSettings.create({ key: 'site', ...DEFAULTS });
    settings = created.toObject();
  }
  return formatPublicSettings(settings);
}

export async function getYouTubeRefreshToken() {
  await connectDB();
  const settings = await SiteSettings.findOne({ key: 'site' }).lean();
  return settings?.youtubeRefreshToken || '';
}

export async function saveYouTubeRefreshToken(refreshToken) {
  await connectDB();
  await SiteSettings.findOneAndUpdate(
    { key: 'site' },
    { $set: { youtubeRefreshToken: refreshToken } },
    { upsert: true }
  );
}

export async function clearYouTubeAuth() {
  await connectDB();
  await SiteSettings.findOneAndUpdate(
    { key: 'site' },
    { $set: { youtubeRefreshToken: '' } },
    { upsert: true }
  );
}

export async function updateSiteSettings(updates) {
  await connectDB();
  const allowed = [
    'commentsEnabled',
    'appDownloadEnabled',
    'youtubeChannelId',
    'youtubeChannelUrl',
    'googleAnalyticsId',
    'googleAnalyticsPropertyId',
    'adsEnabled',
    'adsenseClientId',
  ];
  const patch = {};
  allowed.forEach((key) => {
    if (updates[key] !== undefined) patch[key] = updates[key];
  });
  if (updates.youtubeChannelUrl !== undefined) {
    const id = extractChannelId(updates.youtubeChannelUrl);
    if (id) patch.youtubeChannelId = id;
  }
  if (typeof patch.googleAnalyticsId === 'string') {
    patch.googleAnalyticsId = patch.googleAnalyticsId.trim();
  }
  if (typeof patch.googleAnalyticsPropertyId === 'string') {
    patch.googleAnalyticsPropertyId = patch.googleAnalyticsPropertyId.trim();
  }
  if (typeof patch.adsenseClientId === 'string') {
    patch.adsenseClientId = patch.adsenseClientId.trim();
  }
  ['adSlotHeader', 'adSlotSidebar', 'adSlotInArticle', 'adSlotAfterArticle'].forEach((key) => {
    if (updates[key] !== undefined) {
      patch[key] = normalizeAdSlot(updates[key]);
    }
  });

  const settings = await SiteSettings.findOneAndUpdate(
    { key: 'site' },
    { $set: patch },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  return formatPublicSettings(settings);
}
