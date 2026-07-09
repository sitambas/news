import { getServerUser } from '@/lib/auth';
import {
  clearYouTubeAuth,
  getSiteSettings,
  getYouTubeRedirectUrisForConsole,
  getYouTubeJavaScriptOrigins,
  isYouTubeApiConfigured,
} from '@/lib/siteSettings';

function getRedirectUriUsed() {
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI.replace(/\/$/, '');
  }
  const base = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://cgfile.in';
  return `${base.replace(/\/$/, '')}/api/youtube/callback`;
}
import { errorResponse, successResponse } from '@/utils/apiResponse';

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    const settings = await getSiteSettings();
    return successResponse({
      connected: settings.youtubeConnected,
      apiConfigured: isYouTubeApiConfigured(),
      channelId: settings.youtubeChannelId,
      channelUrl: settings.youtubeChannelUrl,
      redirectUris: getYouTubeRedirectUrisForConsole(),
      javascriptOrigins: getYouTubeJavaScriptOrigins(),
      clientId: process.env.GOOGLE_CLIENT_ID || null,
      redirectUriUsed: getRedirectUriUsed(),
    });
  } catch (error) {
    console.error('YouTube status error:', error);
    return errorResponse('स्थिति लोड करने में विफल', 500);
  }
}

export async function DELETE() {
  try {
    const user = await getServerUser();
    if (!user || user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    await clearYouTubeAuth();
    return successResponse(null, 'YouTube डिस्कनेक्ट हो गया');
  } catch (error) {
    console.error('YouTube disconnect error:', error);
    return errorResponse('डिस्कनेक्ट विफल', 500);
  }
}
