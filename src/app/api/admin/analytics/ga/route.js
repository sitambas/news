import { getServerUser } from '@/lib/auth';
import {
  fetchGaOverview,
  fetchGaRealtime,
  getGaPropertyId,
  isGaReportingConfigured,
} from '@/lib/googleAnalytics';
import { getSiteSettings } from '@/lib/siteSettings';
import { errorResponse, successResponse } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'editor'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    const settings = await getSiteSettings();
    const measurementId = settings.googleAnalyticsId || '';
    const propertyId = getGaPropertyId(settings.googleAnalyticsPropertyId);
    const reportingConfigured = isGaReportingConfigured(propertyId);

    let realtime = { configured: false, activeUsers: 0, topPages: [] };
    let overview = { configured: false };

    if (reportingConfigured) {
      try {
        [realtime, overview] = await Promise.all([
          fetchGaRealtime(propertyId),
          fetchGaOverview({ days: 7, propertyId }),
        ]);
      } catch (err) {
        console.error('GA Data API error:', err);
        return successResponse({
          measurementId,
          propertyId,
          trackingEnabled: Boolean(measurementId),
          reportingConfigured: true,
          error: err.message || 'Google Analytics रिपोर्ट लोड नहीं हुई',
          realtime: { configured: true, activeUsers: 0, topPages: [] },
          overview: { configured: true },
        });
      }
    }

    return successResponse({
      measurementId,
      propertyId,
      trackingEnabled: Boolean(measurementId),
      reportingConfigured,
      realtime,
      overview,
      dashboardUrl: measurementId
        ? 'https://analytics.google.com/analytics/web/'
        : '',
    });
  } catch (error) {
    console.error('GA analytics route error:', error);
    return errorResponse('Google Analytics लोड करने में विफल', 500);
  }
}
