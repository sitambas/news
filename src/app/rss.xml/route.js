import connectDB from '@/lib/db';
import Article from '@/models/Article';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cgfile.in';
const SITE_TITLE = 'CGFILE - ब्रेकिंग न्यूज़ और ताज़ा खबरें';
const SITE_DESCRIPTION =
  'ब्रेकिंग न्यूज़, गहन विश्लेषण और छत्तीसगढ़ व देश भर की नवीनतम खबरें।';

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toAbsoluteUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatRssDate(date) {
  if (!date) return new Date().toUTCString();
  return new Date(date).toUTCString();
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    const articles = await Article.find({ status: 'published' })
      .populate('category', 'name slug')
      .populate('reporter', 'name')
      .select('title slug excerpt content coverImage coverImageAlt publishedAt updatedAt location')
      .sort({ publishedAt: -1 })
      .limit(50)
      .lean();

    const lastBuild = articles[0]?.publishedAt || articles[0]?.updatedAt || new Date();

    const items = articles
      .map((article) => {
        const link = `${SITE_URL}/news/${article.slug}`;
        const description = escapeXml(
          article.excerpt?.trim() ||
            stripHtml(article.content).slice(0, 300) ||
            article.title
        );
        const author = escapeXml(article.reporter?.name || 'CGFILE');
        const category = escapeXml(article.category?.name || 'समाचार');
        const pubDate = formatRssDate(article.publishedAt || article.updatedAt);
        const imageUrl = toAbsoluteUrl(article.coverImage);

        let itemXml = `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${author}</author>
      <category>${category}</category>`;

        if (article.location) {
          itemXml += `\n      <source url="${link}">${escapeXml(article.location)}</source>`;
        }

        if (imageUrl) {
          const enclosureType = imageUrl.match(/\.png/i)
            ? 'image/png'
            : imageUrl.match(/\.webp/i)
            ? 'image/webp'
            : 'image/jpeg';
          itemXml += `\n      <enclosure url="${escapeXml(imageUrl)}" type="${enclosureType}" />`;
        }

        itemXml += '\n    </item>';
        return itemXml;
      })
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>hi-IN</language>
    <lastBuildDate>${formatRssDate(lastBuild)}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/og-image.jpg</url>
      <title>${escapeXml(SITE_TITLE)}</title>
      <link>${SITE_URL}</link>
    </image>${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('RSS feed error:', error);
    return new Response('RSS feed unavailable', { status: 500 });
  }
}
