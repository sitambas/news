import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import {
  getYouTubeOAuthUrl,
  getYouTubeRedirectUri,
  isYouTubeApiConfigured,
} from '@/lib/siteSettings';
import { errorResponse } from '@/utils/apiResponse';

export async function GET(request) {
  try {
    const user = await getServerUser();
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    if (!isYouTubeApiConfigured()) {
      return errorResponse(
        'Google OAuth कॉन्फ़िगर नहीं है। .env में GOOGLE_CLIENT_ID और GOOGLE_CLIENT_SECRET जोड़ें।',
        503
      );
    }

    const redirectUri = getYouTubeRedirectUri(request);
    const state = crypto.randomUUID();
    const cookieStore = await cookies();
    cookieStore.set('youtube_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });
    cookieStore.set('youtube_oauth_redirect', redirectUri, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });

    return NextResponse.redirect(getYouTubeOAuthUrl(state, redirectUri));
  } catch (error) {
    console.error('YouTube auth error:', error);
    return errorResponse('YouTube कनेक्ट करने में विफल', 500);
  }
}
