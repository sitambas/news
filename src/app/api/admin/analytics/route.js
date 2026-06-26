import connectDB from '@/lib/db';
import Article from '@/models/Article';
import User from '@/models/User';
import Category from '@/models/Category';
import { getServerUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';

const MONTH_LABELS = ['जन', 'फर', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्ट', 'नव', 'दिस'];

function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function percentChange(current, previous) {
  if (previous === 0) {
    if (current === 0) return { text: '0%', up: true };
    return { text: `+${current}`, up: true };
  }
  const pct = ((current - previous) / previous) * 100;
  const rounded = Math.abs(pct) >= 10 ? pct.toFixed(0) : pct.toFixed(1);
  return {
    text: `${pct >= 0 ? '+' : ''}${rounded}%`,
    up: pct >= 0,
  };
}

function formatAvgReadingTime(minutes) {
  if (!minutes || minutes <= 0) return '—';
  const whole = Math.floor(minutes);
  const secs = Math.round((minutes - whole) * 60);
  if (whole === 0) return `${secs} सेकंड`;
  if (secs === 0) return `${whole} मिनट`;
  return `${whole}m ${secs}s`;
}

export async function GET() {
  try {
    const currentUser = await getServerUser();
    if (!currentUser) return errorResponse('Unauthorized', 401);
    if (!['admin', 'editor'].includes(currentUser.role)) {
      return errorResponse('Forbidden', 403);
    }

    await connectDB();

    const now = new Date();
    const year = now.getFullYear();
    const yearStart = new Date(year, 0, 1);
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const [
      totalViewsAgg,
      publishedCount,
      totalUsers,
      avgReadingAgg,
      publishedThisMonth,
      publishedLastMonth,
      usersThisMonth,
      usersLastMonth,
      topArticles,
      monthlyAgg,
      categoryAgg,
    ] = await Promise.all([
      Article.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      Article.countDocuments({ status: 'published' }),
      User.countDocuments(),
      Article.aggregate([
        { $match: { status: 'published', readingTime: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$readingTime' } } },
      ]),
      Article.countDocuments({ status: 'published', publishedAt: { $gte: thisMonthStart } }),
      Article.countDocuments({
        status: 'published',
        publishedAt: { $gte: lastMonthStart, $lt: thisMonthStart },
      }),
      User.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      User.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
      Article.find({ status: 'published' })
        .populate('category', 'name slug color')
        .populate('reporter', 'name')
        .select('title slug views readingTime publishedAt coverImage')
        .sort({ views: -1 })
        .limit(5)
        .lean(),
      Article.aggregate([
        { $match: { status: 'published', publishedAt: { $gte: yearStart } } },
        {
          $group: {
            _id: { $month: { date: '$publishedAt', timezone: 'Asia/Kolkata' } },
            views: { $sum: '$views' },
            articles: { $sum: 1 },
          },
        },
      ]),
      Article.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', views: { $sum: '$views' }, articles: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 6 },
      ]),
    ]);

    const totalViews = totalViewsAgg[0]?.total || 0;
    const avgReadingTime = avgReadingAgg[0]?.avg || 0;
    const publishedChange = percentChange(publishedThisMonth, publishedLastMonth);
    const usersChange = percentChange(usersThisMonth, usersLastMonth);

    const monthlyMap = Object.fromEntries(monthlyAgg.map((row) => [row._id, row]));
    const monthlyChart = MONTH_LABELS.map((label, index) => {
      const month = index + 1;
      const row = monthlyMap[month];
      return {
        month: label,
        views: row?.views || 0,
        articles: row?.articles || 0,
      };
    });

    const yearViewsTotal = monthlyChart.reduce((sum, m) => sum + m.views, 0);

    const categoryIds = categoryAgg.map((c) => c._id).filter(Boolean);
    const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
    const categoryMap = Object.fromEntries(categories.map((c) => [String(c._id), c]));

    const categoryBreakdown = categoryAgg
      .filter((row) => row._id)
      .map((row) => {
        const cat = categoryMap[String(row._id)];
        const percent = totalViews > 0 ? Math.round((row.views / totalViews) * 100) : 0;
        return {
          name: cat?.name || 'अन्य',
          slug: cat?.slug || '',
          color: cat?.color || '#6B7280',
          icon: cat?.icon || '📰',
          views: row.views,
          articles: row.articles,
          percent,
        };
      });

    return successResponse({
      stats: {
        totalViews,
        publishedCount,
        totalUsers,
        avgReadingTime: formatAvgReadingTime(avgReadingTime),
        publishedChange,
        usersChange,
        year,
        yearViewsTotal,
      },
      monthlyChart,
      topArticles,
      categoryBreakdown,
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return errorResponse('विश्लेषण लोड करने में विफल', 500);
  }
}
