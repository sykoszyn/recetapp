'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function StepTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, remaining]);

  useEffect(() => {
    if (remaining === 0) setRunning(false);
  }, [remaining]);

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-3">
      <Timer className="h-5 w-5 text-primary" />
      <span className="flex-1 text-xl font-bold tabular-nums">{formatTime(remaining)}</span>
      <Button type="button" variant="outline" size="icon-sm" onClick={() => setRunning((r) => !r)} disabled={remaining === 0}>
        {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => {
          setRemaining(seconds);
          setRunning(false);
        }}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
