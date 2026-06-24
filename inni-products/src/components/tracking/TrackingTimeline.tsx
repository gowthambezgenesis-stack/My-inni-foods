import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrackingHistoryEvent } from '../../types';
import {
  formatTimelineTimestamp,
  getTimelineProgressRatio,
} from '../../lib/trackingTimeline';
import { cn } from '../../lib/utils';

const PROGRESS_DURATION = 1;
const PROGRESS_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface TrackingTimelineProps {
  events: TrackingHistoryEvent[];
  variant?: 'default' | 'compact';
  className?: string;
}

function TimelineDot({ event, compact }: { event: TrackingHistoryEvent; compact: boolean }) {
  const sizeClass = compact ? 'h-3 w-3' : 'h-3.5 w-3.5';

  if (event.is_current) {
    return (
      <span className={cn('relative flex items-center justify-center', compact ? 'h-5 w-5' : 'h-6 w-6')}>
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/30"
          animate={{ scale: [1, 1.55, 1], opacity: [0.65, 0.15, 0.65] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span
          className={cn(
            sizeClass,
            'relative rounded-full border-[3px] border-emerald-500 bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.55)]',
          )}
        />
      </span>
    );
  }

  if (event.completed) {
    return (
      <span
        className={cn(
          sizeClass,
          'rounded-full border-[3px] border-emerald-500 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.25)]',
        )}
      />
    );
  }

  return (
    <span className={cn(sizeClass, 'rounded-full border-[3px] border-neutral-300 bg-white')} />
  );
}

export function TrackingTimeline({
  events,
  variant = 'default',
  className,
}: TrackingTimelineProps) {
  const compact = variant === 'compact';
  const progressRatio = useMemo(() => getTimelineProgressRatio(events), [events]);

  const trackTop = compact ? 10 : 12;
  const trackBottom = compact ? 10 : 12;
  const lineOffset = compact ? 9 : 11;

  return (
    <div className={cn('relative', className)}>
      <div
        className="pointer-events-none absolute w-0.5 rounded-full bg-neutral-200"
        style={{
          left: lineOffset,
          top: trackTop,
          bottom: trackBottom,
        }}
      />

      <motion.div
        className="pointer-events-none absolute w-0.5 rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
        style={{
          left: lineOffset,
          top: trackTop,
          transformOrigin: 'top center',
        }}
        initial={{ height: 0 }}
        animate={{
          height: `calc((100% - ${trackTop + trackBottom}px) * ${progressRatio})`,
        }}
        transition={{ duration: PROGRESS_DURATION, ease: PROGRESS_EASE }}
      />

      <div className="relative space-y-0">
        {events.map((event, index) => {
          const isLast = index === events.length - 1;
          const rowMinHeight = compact ? 56 : 72;

          return (
            <motion.div
              key={event.title}
              className="flex gap-3 sm:gap-4"
              initial={false}
              animate={{ opacity: event.completed ? 1 : 0.72 }}
              transition={{ duration: 0.35 }}
              style={{ minHeight: isLast ? undefined : rowMinHeight }}
            >
              <div className="flex w-5 shrink-0 flex-col items-center sm:w-6">
                <TimelineDot event={event} compact={compact} />
              </div>

              <div className={cn('min-w-0 flex-1', !isLast && (compact ? 'pb-4' : 'pb-6'))}>
                <motion.p
                  className={cn(
                    'font-semibold leading-snug',
                    compact ? 'text-sm' : 'text-base',
                    event.is_current
                      ? 'text-neutral-950'
                      : event.completed
                        ? 'text-neutral-800'
                        : 'text-neutral-400',
                  )}
                  animate={{ x: event.is_current ? [0, 2, 0] : 0 }}
                  transition={
                    event.is_current
                      ? { duration: 0.8, ease: PROGRESS_EASE }
                      : { duration: 0.3 }
                  }
                >
                  {event.title}
                </motion.p>

                {event.timestamp ? (
                  <p className={cn('mt-1 text-neutral-500', compact ? 'text-xs' : 'text-sm')}>
                    {formatTimelineTimestamp(event.timestamp)}
                  </p>
                ) : (
                  <p className={cn('mt-1 text-neutral-400 italic', compact ? 'text-xs' : 'text-sm')}>
                    Awaiting update
                  </p>
                )}

                <p className={cn('mt-1 text-neutral-600', compact ? 'text-xs' : 'text-sm')}>
                  {event.location}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
