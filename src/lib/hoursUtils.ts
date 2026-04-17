import type { BusinessHoursJson, DayKey, DayEntry, DayHours } from './getListings';

export type HoursState = 'open' | 'closed' | 'special' | 'unknown';

export interface HoursStatus {
  state: HoursState;
  label: string;
}

const TZ = 'America/Chicago';
const DAY_KEYS: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABELS: Record<DayKey, string> = {
  sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed',
  thu: 'Thu', fri: 'Fri', sat: 'Sat',
};

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h < 12 ? 'am' : 'pm';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const mins = m > 0 ? `:${String(m).padStart(2, '0')}` : '';
  return `${hour12}${mins}${period}`;
}

function getCurrentChicagoTime(now: Date): { dayKey: DayKey; dayIndex: number; minutesOfDay: number } {
  const dayStr = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' })
    .format(now)
    .toLowerCase()
    .slice(0, 3) as DayKey;

  const timeParts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now);

  const hour = parseInt(timeParts.find(p => p.type === 'hour')?.value ?? '0');
  const minute = parseInt(timeParts.find(p => p.type === 'minute')?.value ?? '0');

  return {
    dayKey: dayStr,
    dayIndex: DAY_KEYS.indexOf(dayStr),
    minutesOfDay: Math.min(hour, 23) * 60 + minute,
  };
}

function parseMins(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function isSpecial(entry: DayEntry): entry is { special: string } {
  return entry != null && !Array.isArray(entry) && 'special' in entry;
}

function checkOpen(sessions: DayHours[], minutesOfDay: number): string | null {
  for (const s of sessions) {
    const openMins = parseMins(s.open);
    let closeMins = parseMins(s.close);
    if (closeMins <= openMins) closeMins += 1440; // midnight crossing
    const current = minutesOfDay < openMins ? minutesOfDay + 1440 : minutesOfDay;
    if (current >= openMins && current < closeMins) {
      const closeHhmm = closeMins >= 1440
        ? `${String(Math.floor((closeMins - 1440) / 60)).padStart(2, '0')}:${String((closeMins - 1440) % 60).padStart(2, '0')}`
        : s.close;
      return formatTime(closeHhmm);
    }
  }
  return null;
}

export function getHoursStatus(
  hoursJson: BusinessHoursJson | null | undefined,
  now: Date = new Date(),
): HoursStatus {
  if (!hoursJson || Object.keys(hoursJson.hours).length === 0) {
    return { state: 'unknown', label: '' };
  }

  const { dayKey, dayIndex, minutesOfDay } = getCurrentChicagoTime(now);
  const todayEntry = hoursJson.hours[dayKey];

  if (todayEntry && isSpecial(todayEntry)) {
    return { state: 'special', label: todayEntry.special };
  }

  if (Array.isArray(todayEntry)) {
    const closeTime = checkOpen(todayEntry, minutesOfDay);
    if (closeTime) return { state: 'open', label: `Until ${closeTime}` };

    // Future sessions today
    const futureToday = todayEntry.filter(s => parseMins(s.open) > minutesOfDay);
    if (futureToday.length > 0) {
      return { state: 'closed', label: `Opens today at ${formatTime(futureToday[0].open)}` };
    }
  }

  // Walk forward up to 6 more days
  for (let i = 1; i <= 6; i++) {
    const nextKey = DAY_KEYS[(dayIndex + i) % 7];
    const nextEntry = hoursJson.hours[nextKey];
    if (!Array.isArray(nextEntry) || nextEntry.length === 0) continue;
    return { state: 'closed', label: `Opens ${DAY_LABELS[nextKey]} at ${formatTime(nextEntry[0].open)}` };
  }

  return { state: 'closed', label: '' };
}
