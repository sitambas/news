import { getYouTubeEmbedUrl } from '@/utils/youtube';

export default function YouTubePlayer({ url, title = 'YouTube video' }) {
  const embedUrl = getYouTubeEmbedUrl(url);
  if (!embedUrl) return null;

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8 bg-black shadow-lg ring-1 ring-gray-200 dark:ring-gray-800">
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
        loading="lazy"
      />
    </div>
  );
}
