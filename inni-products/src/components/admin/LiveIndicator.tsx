import { useEffect, useState } from 'react';

import { cn } from '../../lib/utils';

interface LiveIndicatorProps {
  lastUpdated: Date | null;
  className?: string;
}

export function LiveIndicator({ lastUpdated, className }: LiveIndicatorProps) {
  const [, tick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => tick((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const secondsAgo =
    lastUpdated === null ? null : Math.max(0, Math.floor((Date.now() - lastUpdated.getTime()) / 1000));

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-emerald-400', className)}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      Live{secondsAgo !== null ? ` · updated ${secondsAgo}s ago` : ''}
    </span>
  );
}
