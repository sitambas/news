import { formatDistanceToNow, format } from 'date-fns';

export function formatDate(date, pattern = 'MMM dd, yyyy') {
  if (!date) return '';
  return format(new Date(date), pattern);
}

export function timeAgo(date) {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function truncateText(text, maxLength = 150) {
  if (!text) return '';
  const stripped = text.replace(/<[^>]*>/g, '');
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength).trim() + '...';
}

export function calculateReadingTime(content) {
  if (!content) return 1;
  const text = content.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num?.toString() || '0';
}

export function generateShareUrls(url, title) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  return {
    twitter: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encoded}&title=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
    telegram: `https://t.me/share/url?url=${encoded}&text=${encodedTitle}`,
    copy: url,
  };
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getInitials(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function buildQueryString(params) {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

export const CATEGORY_COLORS = {
  Politics: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Technology: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Business: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Science: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Sports: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Entertainment: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  Health: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  World: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};
