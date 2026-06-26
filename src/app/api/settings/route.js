import { getServerUser } from '@/lib/auth';
import { getSiteSettings, updateSiteSettings } from '@/lib/siteSettings';
import { errorResponse, successResponse } from '@/utils/apiResponse';

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return successResponse(settings);
  } catch (error) {
    console.error('Settings GET error:', error);
    return errorResponse('सेटिंग्स लोड करने में विफल', 500);
  }
}

export async function PUT(request) {
  try {
    const user = await getServerUser();
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    const body = await request.json();
    const settings = await updateSiteSettings(body);
    return successResponse(settings, 'सेटिंग्स अपडेट हुईं');
  } catch (error) {
    console.error('Settings PUT error:', error);
    return errorResponse('सेटिंग्स सहेजने में विफल', 500);
  }
}
