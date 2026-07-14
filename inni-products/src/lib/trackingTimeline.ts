import { TrackingHistoryEvent } from '../types';

export function formatTimelineTimestamp(value: string) {
  const date = new Date(value);
  const day = Number(
    new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      timeZone: 'Asia/Kolkata',
    }).format(date),
  );
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th';

  const datePart = date
    .toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    })
    .replace(/^\d+/, `${day}${suffix}`);

  return datePart;
}

export function getActiveTimelineIndex(events: TrackingHistoryEvent[]): number {
  const currentIndex = events.findIndex((event) => event.is_current);
  if (currentIndex >= 0) {
    return currentIndex;
  }

  for (let index = events.length - 1; index >= 0; index -= 1) {
    if (events[index].completed) {
      return index;
    }
  }

  return 0;
}

export function getTimelineProgressRatio(events: TrackingHistoryEvent[]): number {
  if (events.length <= 1) {
    return 1;
  }

  const activeIndex = getActiveTimelineIndex(events);
  return activeIndex / (events.length - 1);
}
