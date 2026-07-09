export const DEFAULT_YOUTUBE_CHANNEL_ID = 'UCE1hbl2-GZ75PjUdx85zuVQ';
export const DEFAULT_YOUTUBE_CHANNEL_URL =
  'https://www.youtube.com/channel/UCE1hbl2-GZ75PjUdx85zuVQ';

export function getYouTubeStudioUploadUrl(channelId = DEFAULT_YOUTUBE_CHANNEL_ID) {
  return `https://studio.youtube.com/channel/${channelId}/videos/upload`;
}

export function getYouTubeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
