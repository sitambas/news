'use client';

import { Fragment } from 'react';
import Image from 'next/image';

export function getArticleImages(article) {
  const list = [];
  if (Array.isArray(article?.coverImages)) {
    article.coverImages.forEach((u) => {
      if (typeof u === 'string' && u.trim()) list.push(u.trim());
    });
  }
  if (article?.coverImage && !list.includes(article.coverImage)) {
    list.unshift(article.coverImage);
  }
  return [...new Set(list)];
}

/** Split HTML into top-level block elements for image insertion. */
function splitHtmlBlocks(html) {
  if (!html?.trim()) return [];
  const re =
    /<(p|h[1-6]|ul|ol|blockquote|pre|table|figure|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>|<(?:hr|br)\s*\/?>/gi;
  const blocks = [];
  let lastIndex = 0;
  let match;
  while ((match = re.exec(html)) !== null) {
    if (match.index > lastIndex) {
      const gap = html.slice(lastIndex, match.index).trim();
      if (gap) blocks.push(gap);
    }
    blocks.push(match[0]);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < html.length) {
    const rest = html.slice(lastIndex).trim();
    if (rest) blocks.push(rest);
  }
  return blocks.length ? blocks : [html];
}

/**
 * Pick block indices after which to insert inline images.
 * Spreads evenly through content (middle / thirds / etc.).
 */
function getInsertAfterIndices(blocks, imageCount) {
  if (imageCount <= 0 || blocks.length === 0) return [];

  const pIndices = blocks
    .map((b, i) => (/^<p[\s>]/i.test(b.trim()) ? i : -1))
    .filter((i) => i >= 0);

  const pool = pIndices.length >= Math.min(imageCount, 2) ? pIndices : blocks.map((_, i) => i);
  if (!pool.length) return [];

  const indices = [];
  for (let i = 1; i <= imageCount; i += 1) {
    const slot = Math.round((i * (pool.length + 1)) / (imageCount + 1)) - 1;
    const clamped = Math.max(0, Math.min(pool.length - 1, slot));
    indices.push(pool[clamped]);
  }

  const unique = [];
  let last = -1;
  for (const idx of indices) {
    let next = Math.max(idx, last + 1);
    if (next >= blocks.length) next = blocks.length - 1;
    if (!unique.includes(next)) unique.push(next);
    last = next;
  }
  return unique.slice(0, imageCount);
}

function ArticleFigure({ src, alt, caption, priority = false, className = '' }) {
  if (!src) return null;
  return (
    <figure className={`not-prose ${className}`}>
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={src}
          alt={alt || 'Article image'}
          fill
          priority={priority}
          className="object-cover select-none pointer-events-none"
          draggable={false}
          unoptimized={src.startsWith('/uploads/')}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * 1 image  → top only
 * 2 images → 1st top, 2nd middle of content
 * 3+       → 1st top, rest evenly through content after paragraphs
 */
export default function ArticleImageGallery({ article, content }) {
  const images = getArticleImages(article);
  const alt = article?.coverImageAlt || article?.title || 'Cover';
  const html = content || article?.content || '';
  const blocks = splitHtmlBlocks(html);

  const topImage = images[0] || null;
  const inlineImages = images.slice(1);
  const insertAfter = getInsertAfterIndices(blocks, inlineImages.length);
  const insertMap = new Map();
  insertAfter.forEach((blockIdx, i) => {
    if (!insertMap.has(blockIdx)) insertMap.set(blockIdx, []);
    insertMap.get(blockIdx).push(inlineImages[i]);
  });

  const placed = insertAfter.length;
  const leftovers = inlineImages.slice(placed);

  if (!topImage && !blocks.length) return null;

  return (
    <>
      {topImage ? (
        <ArticleFigure
          src={topImage}
          alt={alt}
          caption={article?.coverImageAlt || null}
          priority
          className="mb-8"
        />
      ) : null}

      <div className="article-content prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
        {blocks.map((block, i) => (
          <Fragment key={`block-${i}`}>
            <div className="contents" dangerouslySetInnerHTML={{ __html: block }} />
            {(insertMap.get(i) || []).map((src, j) => (
              <ArticleFigure
                key={`inline-${i}-${j}`}
                src={src}
                alt={`${alt} (${j + 2})`}
                className="my-8"
              />
            ))}
          </Fragment>
        ))}
        {leftovers.map((src, j) => (
          <ArticleFigure
            key={`leftover-${j}`}
            src={src}
            alt={`${alt} (${placed + j + 2})`}
            className="my-8"
          />
        ))}
      </div>
    </>
  );
}
