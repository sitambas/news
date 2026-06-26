export function getReporterLocations(reporter) {
  if (!reporter) return [];
  if (Array.isArray(reporter.locations) && reporter.locations.length > 0) {
    return reporter.locations.filter(Boolean);
  }
  if (reporter.defaultLocation) return [reporter.defaultLocation];
  return [];
}

export function getReporterName(reporter) {
  if (!reporter) return '';
  if (typeof reporter === 'object' && reporter.name) return reporter.name;
  if (typeof reporter === 'string') return reporter;
  return '';
}

export function getReporterId(reporter) {
  if (!reporter) return '';
  if (typeof reporter === 'object' && reporter._id) return String(reporter._id);
  return '';
}

/** Public byline: prefer assigned reporter over CMS author (admin). */
export function getArticleBylineName(article) {
  return getReporterName(article?.reporter);
}

export function getArticleBylineInitial(article) {
  const name = getArticleBylineName(article);
  return name?.[0] || 'र';
}
