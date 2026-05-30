const rateLimitMap = new Map();

export function rateLimit(options = {}) {
  const { max = 100, windowMs = 15 * 60 * 1000 } = options;

  return function checkRateLimit(request) {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const key = ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, []);
    }

    const requests = rateLimitMap.get(key).filter((time) => time > windowStart);
    requests.push(now);
    rateLimitMap.set(key, requests);

    if (requests.length > max) {
      return { limited: true, remaining: 0, reset: new Date(windowStart + windowMs) };
    }

    return { limited: false, remaining: max - requests.length, reset: new Date(windowStart + windowMs) };
  };
}
