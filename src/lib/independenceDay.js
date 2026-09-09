/**
 * Independence Day festive theme — Asia/Kolkata calendar.
 * Active from 15 August through 17 August (inclusive); off after midnight IST on the 17th.
 */
export function isIndependenceDay(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);

    const month = parts.find((p) => p.type === 'month')?.value;
    const day = Number(parts.find((p) => p.type === 'day')?.value);
    return month === '08' && day >= 15 && day <= 17;
  } catch {
    return false;
  }
}
