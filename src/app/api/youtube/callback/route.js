import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  exchangeYouTubeCode,
  saveYouTubeRefreshToken,
  isYouTubeApiConfigured,
} from '@/lib/siteSettings';

function redirectToSettings(message, type = 'success') {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || '';
  const params = new URLSearchParams({ youtube: type, msg: message });
  return NextResponse.redirect(`${base}/admin/settings?${params}`);
}

export async function GET(request) {
  try {
    if (!isYouTubeApiConfigured()) {
      return redirectToSettings('Google OAuth कॉन्फ़िगर नहीं है', 'error');
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      const desc = searchParams.get('error_description') || error;
      console.error('YouTube OAuth error from Google:', error, desc);
      return redirectToSettings(`Google OAuth: ${desc}`, 'error');
    }

    const cookieStore = await cookies();
    const savedState = cookieStore.get('youtube_oauth_state')?.value;
    const redirectUri = cookieStore.get('youtube_oauth_redirect')?.value;
    cookieStore.delete('youtube_oauth_state');
    cookieStore.delete('youtube_oauth_redirect');

    if (!code || !state || state !== savedState) {
      return redirectToSettings('अमान्य OAuth प्रतिक्रिया', 'error');
    }

    const tokens = await exchangeYouTubeCode(code, redirectUri);
    if (!tokens.refresh_token) {
      return redirectToSettings(
        'Refresh token नहीं मिला। Google अकाउंट डिस्कनेक्ट करके फिर कनेक्ट करें।',
        'error'
      );
    }

    await saveYouTubeRefreshToken(tokens.refresh_token);
    return redirectToSettings('CGFile YouTube चैनल कनेक्ट हो गया');
  } catch (err) {
    console.error('YouTube callback error:', err);
    return redirectToSettings(err.message || 'कनेक्शन विफल', 'error');
  }
}
