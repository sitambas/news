'use client';

/**
 * Responsive ad banner with optional mobile creative.
 * Uses <picture> so phones get mobileImageUrl when set; otherwise desktop src.
 */
export default function AdBannerImage({
  src,
  mobileSrc = '',
  alt = 'विज्ञापन',
  linkUrl = '',
  loading = 'lazy',
  className = '',
}) {
  const desktop = (src || '').trim();
  const mobile = (mobileSrc || '').trim();
  if (!desktop && !mobile) return null;

  const fallback = desktop || mobile;

  const media = (
    <picture>
      {mobile && desktop && mobile !== desktop ? (
        <source media="(max-width: 639px)" srcSet={mobile} />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mobile && !desktop ? mobile : fallback}
        alt={alt}
        className="ad-banner-img"
        loading={loading}
        decoding="async"
      />
    </picture>
  );

  return (
    <div className={`ad-banner-frame ${className}`} data-ad="banner">
      {linkUrl ? (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="ad-banner-link"
        >
          {media}
        </a>
      ) : (
        media
      )}
    </div>
  );
}
