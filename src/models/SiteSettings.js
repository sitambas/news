import mongoose from 'mongoose';
import {
  DEFAULT_YOUTUBE_CHANNEL_ID,
  DEFAULT_YOUTUBE_CHANNEL_URL,
} from '@/constants/youtube';

const adSlotSchema = new mongoose.Schema(
  {
    adsenseSlot: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    /** Optional creative for phones (≤639px). Falls back to imageUrl. */
    mobileImageUrl: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    alt: { type: String, default: '' },
  },
  { _id: false }
);

const adCarouselItemSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    alt: { type: String, default: '' },
  },
  { _id: false }
);

/** In-feed ads that look like news cards */
const adNativeItemSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    title: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    sponsor: { type: String, default: '' },
    /** Insert after this article number in the feed (1 = after first card). */
    afterArticle: { type: Number, default: 1, min: 1, max: 20 },
    /** Where to show: latest feed, category pages, or both. */
    placement: {
      type: String,
      enum: ['latest', 'category', 'both'],
      default: 'latest',
    },
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
    /** After this instant (IST end-of-day when set from admin date), public ads hide automatically. */
    adsExpiresAt: { type: Date, default: null },
    adsenseClientId: { type: String, default: '' },
    adSlotHeader: { type: adSlotSchema, default: () => ({}) },
    adSlotSidebar: { type: adSlotSchema, default: () => ({}) },
    adSlotLatest: { type: adSlotSchema, default: () => ({}) },
    adSlotHomeMid: { type: adSlotSchema, default: () => ({}) },
    adSlotBetweenCategories: { type: adSlotSchema, default: () => ({}) },
    adSlotInArticle: { type: adSlotSchema, default: () => ({}) },
    adSlotAfterArticle: { type: adSlotSchema, default: () => ({}) },
    adSlotFooter: { type: adSlotSchema, default: () => ({}) },
    adCarousel: { type: [adCarouselItemSchema], default: [] },
    adNative: { type: [adNativeItemSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);
