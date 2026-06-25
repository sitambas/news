import connectDB from '@/lib/db';
import Article from '@/models/Article';
import User from '@/models/User';
import { getServerUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/apiResponse';

const DAY_LABELS = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

function startOfDay(date) {
  const d = new Date(date);
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

export async function GET() {
  try {
    const currentUser = await getServerUser();
    if (!currentUser) return errorResponse('Unauthorized', 401);
    if (!['admin', 'editor', 'author'].includes(currentUser.role)) {
      return errorResponse('Forbidden', 403);
    }

    await connectDB();

    const now = new Date();
    const todayStart = startOfDay(now);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);

    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);

    const [
      totalArticles,
      totalUsers,
      viewsAgg,
      publishedToday,
      publishedYesterday,
      articlesThisWeek,
      articlesPrevWeek,
      usersThisWeek,
      usersPrevWeek,
      recentArticles,
    ] = await Promise.all([
      Article.countDocuments(),
      User.countDocuments(),
      Article.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      Article.countDocuments({ status: 'published', publishedAt: { $gte: todayStart } }),
      Article.countDocuments({
        status: 'published',
        publishedAt: { $gte: yesterdayStart, $lt: todayStart },
      }),
      Article.countDocuments({ createdAt: { $gte: weekStart } }),
      Article.countDocuments({ createdAt: { $gte: prevWeekStart, $lt: weekStart } }),
      User.countDocuments({ createdAt: { $gte: weekStart } }),
      User.countDocuments({ createdAt: { $gte: prevWeekStart, $lt: weekStart } }),
      Article.find({})
        .populate('author', 'name username avatar')
        .populate('category', 'name slug color')
        .populate('reporter', 'name')
        .select('-content -likes -bookmarks')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ]);

    const totalViews = viewsAgg[0]?.total || 0;

    const dailyAgg = await Article.aggregate([
      { $match: { publishedAt: { $gte: weekStart } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$publishedAt', timezone: 'Asia/Kolkata' },
          },
          views: { $sum: '$views' },
          published: { $sum: 1 },
        },
      },
    ]);

    const dailyMap = Object.fromEntries(
      dailyAgg.map((row) => [row._id, { views: row.views, published: row.published }])
    );

    const weeklyChart = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart);
      dayStart.setDate(dayStart.getDate() - i);
      const key = dayStart.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      const dayData = dailyMap[key];

      weeklyChart.push({
        label: DAY_LABELS[dayStart.getDay()],
        value: dayData?.views || dayData?.published || 0,
        published: dayData?.published || 0,
      });
    }

    const articlesChange = percentChange(articlesThisWeek, articlesPrevWeek);
    const usersChange = percentChange(usersThisWeek, usersPrevWeek);
    const todayChange = {
      text: publishedToday >= publishedYesterday
        ? `+${publishedToday - publishedYesterday}`
        : `${publishedToday - publishedYesterday}`,
      up: publishedToday >= publishedYesterday,
    };

    return successResponse({
      stats: {
        totalArticles,
        totalUsers,
        totalViews,
        publishedToday,
        articlesChange,
        usersChange,
        todayChange,
      },
      weeklyChart,
      recentArticles,
    });
  } catch (error) {
    console.error('Dashboard GET error:', error);
    return errorResponse('Failed to load dashboard', 500);
  }
}
