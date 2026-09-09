/**
 * Safe JSON-LD script for Google rich results / Knowledge Graph.
 */
export default function JsonLd({ data }) {
  if (!data) return null;
  const payload = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload.length === 1 ? payload[0] : payload).replace(/</g, '\\u003c'),
      }}
    />
  );
}

export function buildWebsiteJsonLd() {
  const origin = (process.env.NEXT_PUBLIC_APP_URL || 'https://cgfile.in').replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsMediaOrganization',
        '@id': `${origin}/#organization`,
        name: 'CGFILE',
        alternateName: ['सीजीफ़ाइल', 'CG File', 'छत्तीसगढ़ फ़ाइल'],
        url: origin,
        logo: {
          '@type': 'ImageObject',
          url: `${origin}/icon`,
          width: 32,
          height: 32,
        },
        sameAs: [],
        publishingPrinciples: `${origin}/about`,
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: origin,
        name: 'CGFILE',
        description:
          'छत्तीसगढ़ और भारत की ब्रेकिंग न्यूज़, ताज़ा खबरें और गहन विश्लेषण।',
        publisher: { '@id': `${origin}/#organization` },
        inLanguage: 'hi-IN',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${origin}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

export function buildNewsArticleJsonLd(article, pageUrl) {
  if (!article) return null;
  const origin = (process.env.NEXT_PUBLIC_APP_URL || 'https://cgfile.in').replace(/\/$/, '');
  const image = article.coverImage
    ? article.coverImage.startsWith('http')
      ? article.coverImage
      : `${origin}${article.coverImage.startsWith('/') ? '' : '/'}${article.coverImage}`
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || article.title,
    image: image ? [image] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author?.name || article.reporter?.name || 'CGFILE',
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'CGFILE',
      logo: {
        '@type': 'ImageObject',
        url: `${origin}/icon`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    inLanguage: 'hi-IN',
    articleSection: article.category?.name,
    keywords: Array.isArray(article.tags) ? article.tags.join(', ') : undefined,
  };
}
