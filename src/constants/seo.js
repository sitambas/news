import { getSiteOrigin } from '@/utils/helpers';

export const SITE_NAME = 'CGFILE';
export const SITE_NAME_FULL = 'CGFILE - छत्तीसगढ़ फ़ाइल';

export const DEFAULT_TITLE = 'CGFILE | छत्तीसगढ़ और भारत की ब्रेकिंग न्यूज़ व ताज़ा खबरें';
export const DEFAULT_DESCRIPTION =
  'CGFILE पर पढ़ें छत्तीसगढ़, भारत और दुनिया की ब्रेकिंग न्यूज़, ताज़ा खबरें, राजनीति, अपराध, तकनीक और गहन विश्लेषण — आपका विश्वसनीय हिंदी समाचार स्रोत।';

export const DEFAULT_KEYWORDS = [
  'CGFILE',
  'सीजीफ़ाइल',
  'छत्तीसगढ़ समाचार',
  'ब्रेकिंग न्यूज़',
  'ताज़ा खबरें',
  'हिंदी समाचार',
  'रायपुर न्यूज़',
  'भारत समाचार',
  'राजनीति',
  'अपराध',
];

export function getDefaultOgImage() {
  const origin = getSiteOrigin();
  return `${origin}/api/og?title=${encodeURIComponent('CGFILE — ब्रेकिंग न्यूज़')}`;
}

export function absoluteUrl(path = '/') {
  const origin = getSiteOrigin();
  if (!path || path === '/') return origin;
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}
