'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function getArticleImages(article) {
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

export default function ArticleImageGallery({ article }) {
  const images = getArticleImages(article);
  const [index, setIndex] = useState(0);

  if (!images.length) return null;

  const current = images[Math.min(index, images.length - 1)];
  const alt = article.coverImageAlt || article.title || 'Cover';

  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="mb-8">
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={current}
          alt={`${alt}${images.length > 1 ? ` (${index + 1}/${images.length})` : ''}`}
          fill
          priority={index === 0}
          className="object-cover select-none pointer-events-none"
          draggable={false}
          unoptimized={current.startsWith('/uploads/')}
          onContextMenu={(e) => e.preventDefault()}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center"
              aria-label="Previous image"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center"
              aria-label="Next image"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-xs">
              {index + 1} / {images.length}
            </div>
          </>
        )}

        {article.coverImageAlt && (
          <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 text-center">
            {article.coverImageAlt}
          </p>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                i === index ? 'border-red-600' : 'border-transparent opacity-80 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
