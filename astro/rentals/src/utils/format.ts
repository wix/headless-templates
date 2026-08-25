import type { Money, PolicyItem, RentalDetails } from './types';

/** Resolve a Wix media URL (handles `wix:image://` internal URIs) into a
 *  sized static URL served from static.wixstatic.com. */
export function resolveWixImage(url?: string, width = 900, height = 675): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  if (url.startsWith('wix:image://')) {
    // wix:image://v1/<mediaId>/<filename>#originWidth=..&originHeight=..
    const rest = url.replace('wix:image://v1/', '');
    const mediaId = rest.split('#')[0].split('/')[0];
    return `https://static.wixstatic.com/media/${mediaId}/v1/fill/w_${width},h_${height},al_c,q_80,enc_auto/image.jpg`;
  }
  return url;
}

/** Format a Money-like value for display. Prefer the SDK's `formatted` string so
 *  the currency matches the store (EUR/GBP/… as configured), never assume `$`. */
export function formatMoney(price?: Money): string | undefined {
  if (!price) return undefined;
  if (price.formatted) return price.formatted;
  if (price.amount != null) {
    const num = Number(price.amount);
    if (!Number.isNaN(num)) {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: price.currency || 'USD',
      }).format(num);
    }
    return `${price.amount} ${price.currency ?? ''}`.trim();
  }
  return undefined;
}

/** Turn a duration in minutes into a friendly label ("1 hr 30 min"). */
export function formatMinutes(minutes?: number): string | undefined {
  if (!minutes || minutes <= 0) return undefined;
  if (minutes % (60 * 24) === 0) {
    const days = minutes / (60 * 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const parts: string[] = [];
  if (hrs) parts.push(`${hrs} hr`);
  if (mins) parts.push(`${mins} min`);
  return parts.join(' ');
}

/** Human-friendly booking length: a single value when min and max match
 *  (e.g. "4 hr"), or a range otherwise (e.g. "1 hr – 8 hr"). */
export function formatDurationRange(
  minMinutes?: number,
  maxMinutes?: number,
): string | undefined {
  const min = formatMinutes(minMinutes);
  if (!min) return undefined;
  if (!maxMinutes || maxMinutes === minMinutes) return min;
  const max = formatMinutes(maxMinutes);
  return max ? `${min} – ${max}` : min;
}

/** Local date/time helpers — Wix availability uses local `YYYY-MM-DDThh:mm:ss`. */
export function toLocalDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

/** Build a plain-language booking policy from a rental's cancellation, payment
 *  and capacity settings. Only facts we actually have are described. */
export function buildBookingPolicy(rental: RentalDetails): PolicyItem[] {
  const items: PolicyItem[] = [];

  const cancel = rental.freeCancellationMinutes;
  items.push({
    kind: 'cancellation',
    text:
      cancel && cancel > 0
        ? `Free cancellation up to ${formatMinutes(cancel)} before your start time. After that, the booking is non-refundable.`
        : 'Cancellation terms are set by the host and confirmed at checkout.',
  });

  if (rental.paymentOnline && rental.paymentInPerson) {
    items.push({ kind: 'payment', text: 'Pay securely online now, or in person on arrival.' });
  } else if (rental.paymentOnline) {
    items.push({ kind: 'payment', text: 'Payment is collected securely online at checkout.' });
  } else if (rental.paymentInPerson) {
    items.push({ kind: 'payment', text: 'Reserve now and pay in person on arrival.' });
  }

  if (rental.maxParticipants === 1) {
    items.push({ kind: 'capacity', text: 'Private booking — the space is reserved for you alone.' });
  } else if (rental.maxParticipants && rental.maxParticipants > 1) {
    items.push({
      kind: 'capacity',
      text: `Accommodates up to ${rental.maxParticipants} guests per booking.`,
    });
  }

  return items;
}

export function formatTimeLabel(localDateTime: string): string {
  // localDateTime is "YYYY-MM-DDThh:mm:ss" (no timezone) — parse the wall-clock parts.
  const time = localDateTime.split('T')[1] ?? '';
  const [hStr, mStr] = time.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h)) return localDateTime;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function dayKeyOf(localDateTime: string): string {
  return localDateTime.split('T')[0] ?? localDateTime;
}

export function formatDayLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  if (!y || !m || !d) return dayKey;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Short "Mon 5" style label for a YYYY-MM-DD key. */
export function niceDate(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  if (!y || !m || !d) return dayKey;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
