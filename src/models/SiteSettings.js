import mongoose from 'mongoose';
import {
  DEFAULT_YOUTUBE_CHANNEL_ID,
  DEFAULT_YOUTUBE_CHANNEL_URL,
} from '@/constants/youtube';

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    commentsEnabled: { type: Boolean, default: false },
    appDownloadEnabled: { type: Boolean, default: false },
    youtubeChannelId: { type: String, default: DEFAULT_YOUTUBE_CHANNEL_ID },
    youtubeChannelUrl: { type: String, default: DEFAULT_YOUTUBE_CHANNEL_URL },
    youtubeRefreshToken: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);
