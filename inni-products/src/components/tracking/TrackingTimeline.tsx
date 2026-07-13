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
  variant?: 'default' | 'compact' | 'mobile';
  className?: string;
}

function TimelineDot({
  event,
  compact,
  mobile,
}: {
  event: TrackingHistoryEvent;
  compact: boolean;
  mobile: boolean;
}) {
  const sizeClass = mobile ? 'h-2 w-2' : compact ? 'h-2.5 w-2.5' : 'h-3 w-3';
  const wrapClass = mobile ? 'h-5 w-5' : compact ? 'h-6 w-6' : 'h-7 w-7';

  if (event.is_current) {
    return (
      <span className={cn('relative flex items-center justify-center', wrapClass)}>
        {!mobile && (
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/20"
            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0.1, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <span
          className={cn(
            sizeClass,
            'relative rounded-full border-2 border-emerald-500 bg-emerald-500',
            !mobile && 'ring-4 ring-emerald-500/15',
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
          'rounded-full border-2 border-emerald-500/90 bg-emerald-500',
          !mobile && 'ring-2 ring-emerald-500/10',
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        sizeClass,
        'rounded-full border-2 border-neutral-200 bg-white',
        !mobile && 'ring-2 ring-neutral-100',
      )}
    />
  );
}

export function TrackingTimeline({
  events,
  variant = 'default',
  className,
}: TrackingTimelineProps) {
  const mobile = variant === 'mobile';
  const compact = variant === 'compact' || mobile;
  const progressRatio = useMemo(() => getTimelineProgressRatio(events), [events]);

  const trackTop = mobile ? 8 : compact ? 12 : 14;
  const trackBottom = mobile ? 8 : compact ? 12 : 14;
  const lineOffset = mobile ? 9 : compact ? 11 : 13;

  return (
    <div className={cn('relative', className)}>
      <div
        className="pointer-events-none absolute w-px rounded-full bg-neutral-200/90"
        style={{
          left: lineOffset,
          top: trackTop,
          bottom: trackBottom,
        }}
      />

      <motion.div
        className="pointer-events-none absolute w-px rounded-full bg-gradient-to-b from-emerald-300 via-emerald-500 to-emerald-500/80"
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
          const rowMinHeight = mobile ? 44 : compact ? 64 : 88;

          return (
            <motion.div
              key={event.title}
              className="flex gap-3 sm:gap-4"
              initial={false}
              animate={{ opacity: event.completed || event.is_current ? 1 : 0.55 }}
              transition={{ duration: 0.35 }}
              style={{ minHeight: isLast ? undefined : rowMinHeight }}
            >
              <div className={cn('flex shrink-0 flex-col items-center', mobile ? 'w-5' : 'w-6 sm:w-7')}>
                <TimelineDot event={event} compact={compact} mobile={mobile} />
              </div>

              <div className={cn('min-w-0 flex-1', !isLast && (mobile ? 'pb-2.5' : compact ? 'pb-5' : 'pb-8'))}>
                <motion.p
                  className={cn(
                    'font-semibold leading-snug tracking-tight',
                    mobile ? 'text-[13px]' : compact ? 'text-sm' : 'text-[15px] sm:text-base',
                    event.is_current
                      ? 'text-emerald-700'
                      : event.completed
                        ? 'text-neutral-900'
                        : 'text-neutral-400',
                  )}
                >
                  {event.title}
                </motion.p>

                {event.timestamp ? (
                  <p className={cn('mt-0.5 text-neutral-500', mobile ? 'text-[11px]' : compact ? 'text-xs' : 'text-sm')}>
                    {formatTimelineTimestamp(event.timestamp)}
                  </p>
                ) : (
                  <p className={cn('mt-0.5 text-neutral-400 italic', mobile ? 'text-[11px]' : compact ? 'text-xs' : 'text-sm')}>
                    Awaiting update
                  </p>
                )}

                <p className={cn('mt-0.5 text-neutral-500/90', mobile ? 'text-[11px] leading-snug' : compact ? 'text-xs' : 'text-sm')}>
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
