import mongoose from 'mongoose';
import {
  DEFAULT_YOUTUBE_CHANNEL_ID,
  DEFAULT_YOUTUBE_CHANNEL_URL,
} from '@/constants/youtube';

const adSlotSchema = new mongoose.Schema(
  {
    adsenseSlot: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    alt: { type: String, default: '' },
  },
  { _id: false }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    commentsEnabled: { type: Boolean, default: false },
    appDownloadEnabled: { type: Boolean, default: false },
    youtubeChannelId: { type: String, default: DEFAULT_YOUTUBE_CHANNEL_ID },
    youtubeChannelUrl: { type: String, default: DEFAULT_YOUTUBE_CHANNEL_URL },
    youtubeRefreshToken: { type: String, default: '' },
    googleAnalyticsId: { type: String, default: '' },
    googleAnalyticsPropertyId: { type: String, default: '' },
    adsEnabled: { type: Boolean, default: true },
    adsenseClientId: { type: String, default: '' },
    adSlotHeader: { type: adSlotSchema, default: () => ({}) },
    adSlotSidebar: { type: adSlotSchema, default: () => ({}) },
    adSlotInArticle: { type: adSlotSchema, default: () => ({}) },
    adSlotAfterArticle: { type: adSlotSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);
