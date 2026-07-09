import { getServerUser } from '@/lib/auth';
import {
  getYouTubeRefreshToken,
  initYouTubeResumableUpload,
  isYouTubeApiConfigured,
  refreshYouTubeAccessToken,
} from '@/lib/siteSettings';
import { errorResponse, successResponse } from '@/utils/apiResponse';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const user = await getServerUser();
    if (!user || !['admin', 'editor', 'author'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    if (!isYouTubeApiConfigured()) {
      return errorResponse(
        'सीधे अपलोड के लिए Admin सेटिंग्स में Google अकाउंट कनेक्ट करें',
        503
      );
    }

    const refreshToken = await getYouTubeRefreshToken();
    if (!refreshToken) {
      return errorResponse(
        'पहले Admin → सेटिंग्स से CGFile YouTube चैनल कनेक्ट करें',
        400
      );
    }

    const body = await request.json();
    const { title, description, mimeType, fileSize, privacyStatus } = body;

    if (!title?.trim()) return errorResponse('वीडियो शीर्षक आवश्यक है', 400);
    if (!mimeType?.startsWith('video/')) return errorResponse('केवल वीडियो फ़ाइल', 400);
    if (!fileSize || fileSize < 1) return errorResponse('अमान्य फ़ाइल आकार', 400);
    if (fileSize > 2 * 1024 * 1024 * 1024) {
      return errorResponse('वीडियो 2GB से छोटा होना चाहिए', 400);
    }

    const accessToken = await refreshYouTubeAccessToken(refreshToken);
    const uploadUrl = await initYouTubeResumableUpload({
      accessToken,
      title: title.trim(),
      description: description || '',
      privacyStatus: privacyStatus || 'public',
      mimeType,
      fileSize,
    });

    return successResponse({ uploadUrl });
  } catch (error) {
    console.error('YouTube upload init error:', error);
    return errorResponse(error.message || 'अपलोड शुरू करने में विफल', 500);
  }
}
