import { getServerUser } from '@/lib/auth';
import {
  getYouTubeRefreshToken,
  initYouTubeResumableUpload,
  isYouTubeApiConfigured,
  refreshYouTubeAccessToken,
} from '@/lib/siteSettings';
import { errorResponse, successResponse } from '@/utils/apiResponse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const MAX_BYTES = 512 * 1024 * 1024; // 512MB via server proxy

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

    const formData = await request.formData();
    const file = formData.get('file');
    const title = String(formData.get('title') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const privacyStatus = String(formData.get('privacyStatus') || 'public');

    if (!file || typeof file === 'string') {
      return errorResponse('वीडियो फ़ाइल आवश्यक है', 400);
    }
    if (!title) return errorResponse('वीडियो शीर्षक आवश्यक है', 400);

    const mimeType = file.type || 'video/mp4';
    if (!mimeType.startsWith('video/')) {
      return errorResponse('केवल वीडियो फ़ाइल', 400);
    }

    const fileSize = file.size || 0;
    if (!fileSize) return errorResponse('अमान्य फ़ाइल आकार', 400);
    if (fileSize > MAX_BYTES) {
      return errorResponse('सर्वर अपलोड के लिए वीडियो 512MB से छोटा होना चाहिए', 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const accessToken = await refreshYouTubeAccessToken(refreshToken);
    const uploadUrl = await initYouTubeResumableUpload({
      accessToken,
      title,
      description,
      privacyStatus,
      mimeType,
      fileSize: buffer.length,
    });

    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(buffer.length),
      },
      body: buffer,
    });

    const putText = await putRes.text();
    if (!putRes.ok) {
      console.error('YouTube PUT error:', putRes.status, putText.slice(0, 500));
      let message = 'YouTube पर अपलोड विफल';
      try {
        const parsed = JSON.parse(putText);
        message = parsed?.error?.message || message;
      } catch {
        // ignore
      }
      return errorResponse(message, 502);
    }

    let video;
    try {
      video = JSON.parse(putText);
    } catch {
      return errorResponse('YouTube प्रतिक्रिया अमान्य', 502);
    }

    if (!video?.id) {
      return errorResponse('YouTube video ID नहीं मिला', 502);
    }

    return successResponse(
      {
        videoId: video.id,
        url: `https://www.youtube.com/watch?v=${video.id}`,
      },
      'वीडियो YouTube पर अपलोड हो गया'
    );
  } catch (error) {
    console.error('YouTube proxy upload error:', error);
    return errorResponse(error.message || 'अपलोड विफल', 500);
  }
}
