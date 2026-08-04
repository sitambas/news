/**
 * Google Analytics 4 Data API helpers (live users + reports).
 * Needs:
 *  - GA_PROPERTY_ID (numeric, Admin → Property settings)
 *  - GA_SERVICE_ACCOUNT_JSON  OR  GA_CLIENT_EMAIL + GA_PRIVATE_KEY
 */

let clientPromise = null;

function getCredentials() {
  if (process.env.GA_SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.GA_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.error('Invalid GA_SERVICE_ACCOUNT_JSON:', e.message);
      return null;
    }
  }

  const email = process.env.GA_CLIENT_EMAIL;
  let key = process.env.GA_PRIVATE_KEY;
  if (!email || !key) return null;
  key = key.replace(/\\n/g, '\n');
  return {
    type: 'service_account',
    client_email: email,
    private_key: key,
  };
}

export function getGaPropertyId(overrideId = '') {
  return (
    (overrideId || '').trim() ||
    (process.env.GA_PROPERTY_ID || process.env.GOOGLE_ANALYTICS_PROPERTY_ID || '').trim()
  );
}

export function isGaReportingConfigured(propertyIdOverride = '') {
  return Boolean(getGaPropertyId(propertyIdOverride) && getCredentials());
}

async function getClient() {
  if (clientPromise) return clientPromise;
  const credentials = getCredentials();
  if (!credentials) return null;

  clientPromise = (async () => {
    const { BetaAnalyticsDataClient } = await import('@google-analytics/data');
    return new BetaAnalyticsDataClient({ credentials });
  })();

  return clientPromise;
}

function metricValue(row, index = 0) {
  return Number(row?.metricValues?.[index]?.value || 0);
}

export async function fetchGaRealtime(propertyIdOverride = '') {
  const propertyId = getGaPropertyId(propertyIdOverride);
  const client = await getClient();
  if (!client || !propertyId) {
    return { configured: false, activeUsers: 0, topPages: [] };
  }

  const [simple] = await client.runRealtimeReport({
    property: `properties/${propertyId}`,
    metrics: [{ name: 'activeUsers' }],
  });
  const [byPage] = await client.runRealtimeReport({
    property: `properties/${propertyId}`,
    metrics: [{ name: 'activeUsers' }],
    dimensions: [{ name: 'unifiedScreenName' }],
    limit: 5,
  });

  return {
    configured: true,
    activeUsers: Number(simple.rows?.[0]?.metricValues?.[0]?.value || 0),
    topPages: (byPage.rows || []).map((row) => ({
      page: row.dimensionValues?.[0]?.value || '(not set)',
      users: metricValue(row),
    })),
  };
}

export async function fetchGaOverview({ days = 7, propertyId: propertyIdOverride = '' } = {}) {
  const propertyId = getGaPropertyId(propertyIdOverride);
  const client = await getClient();
  if (!client || !propertyId) {
    return { configured: false };
  }

  const startDate = `${days}daysAgo`;

  const [report] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate: 'today' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
    ],
  });

  const [byDate] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate: 'today' }],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'screenPageViews' },
    ],
    orderBys: [{ dimension: { dimensionName: 'date' } }],
  });

  const [topPages] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'activeUsers' },
    ],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 8,
  });

  const totals = report.rows?.[0]?.metricValues || [];
  const formatDuration = (seconds) => {
    const s = Math.round(Number(seconds) || 0);
    const m = Math.floor(s / 60);
    const r = s % 60;
    if (m <= 0) return `${r}s`;
    return `${m}m ${r}s`;
  };

  return {
    configured: true,
    days,
    summary: {
      activeUsers: Number(totals[0]?.value || 0),
      sessions: Number(totals[1]?.value || 0),
      pageViews: Number(totals[2]?.value || 0),
      bounceRate: `${(Number(totals[3]?.value || 0) * 100).toFixed(1)}%`,
      avgSessionDuration: formatDuration(totals[4]?.value),
    },
    daily: (byDate.rows || []).map((row) => {
      const raw = row.dimensionValues?.[0]?.value || '';
      const label = raw.length === 8
        ? `${raw.slice(6, 8)}/${raw.slice(4, 6)}`
        : raw;
      return {
        date: label,
        users: Number(row.metricValues?.[0]?.value || 0),
        pageViews: Number(row.metricValues?.[1]?.value || 0),
      };
    }),
    topPages: (topPages.rows || []).map((row) => ({
      path: row.dimensionValues?.[0]?.value || '/',
      views: Number(row.metricValues?.[0]?.value || 0),
      users: Number(row.metricValues?.[1]?.value || 0),
    })),
  };
}
