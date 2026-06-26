import connectDB from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';

const DEFAULTS = { commentsEnabled: false, appDownloadEnabled: false };

export async function getSiteSettings() {
  await connectDB();
  let settings = await SiteSettings.findOne({ key: 'site' }).lean();
  if (!settings) {
    const created = await SiteSettings.create({ key: 'site', ...DEFAULTS });
    settings = created.toObject();
  }
  return {
    commentsEnabled: settings.commentsEnabled ?? DEFAULTS.commentsEnabled,
    appDownloadEnabled: settings.appDownloadEnabled ?? DEFAULTS.appDownloadEnabled,
  };
}

export async function updateSiteSettings(updates) {
  await connectDB();
  const allowed = ['commentsEnabled', 'appDownloadEnabled'];
  const patch = {};
  allowed.forEach((key) => {
    if (updates[key] !== undefined) patch[key] = updates[key];
  });

  const settings = await SiteSettings.findOneAndUpdate(
    { key: 'site' },
    { $set: patch },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  return {
    commentsEnabled: settings.commentsEnabled ?? DEFAULTS.commentsEnabled,
    appDownloadEnabled: settings.appDownloadEnabled ?? DEFAULTS.appDownloadEnabled,
  };
}
