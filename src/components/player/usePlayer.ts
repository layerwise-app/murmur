import { useCallback, useEffect, useRef, useState } from 'react';
import { clipId, clips, listening, type ListeningItem } from '~/content/listening';
import { getEngine } from '~/lib/audio/engine';
import { useEngineState, usePlaybackTime } from '~/lib/audio/hooks';

export const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

export type Sleep = { kind: 'off' } | { kind: 'end' } | { kind: 'minutes'; minutes: number; endsAt: number };
export const SLEEP_STEPS: ({ kind: 'off' } | { kind: 'end' } | { kind: 'minutes'; minutes: number })[] = [
  { kind: 'off' },
  { kind: 'minutes', minutes: 5 },
  { kind: 'minutes', minutes: 15 },
  { kind: 'minutes', minutes: 30 },
  { kind: 'end' }
];

export function trackFor(item: ListeningItem) {
  const id = clipId.item(item.id, item.readBy);
  const clip = clips[id];
  return clip
    ? {
        clip,
        track: {
          clipId: id,
          src: clip.src,
          voiceId: item.readBy,
          owner: 'player' as const,
          itemId: item.id
        }
      }
    : null;
}

/** State and actions for the phone player and the day-of-listening list. */
export function usePlayer() {
  const engine = useEngineState();
  const [itemId, setItemId] = useState(listening[0].id);
  const [cue, setCue] = useState(0);
  const [sleep, setSleep] = useState<Sleep>({ kind: 'off' });
  const [now, setNow] = useState(() => Date.now());
  const item = listening.find((entry) => entry.id === itemId) ?? listening[0];
  const resolved = trackFor(item);
  const isCurrent = resolved !== null && engine.track?.clipId === resolved.track.clipId;
  const playing = isCurrent && (engine.status === 'playing' || engine.status === 'loading');
  const liveTime = usePlaybackTime(isCurrent ? resolved!.track.clipId : null);
  const time = isCurrent ? liveTime : cue;
  const duration = resolved?.clip.duration ?? 0;
  const rate = engine.rate;

  const play = useCallback(
    (next: ListeningItem, from?: number) => {
      const target = trackFor(next);
      if (!target) return;
      setItemId(next.id);
      getEngine().play(target.track, { from, rate: getEngine().state.rate });
    },
    []
  );

  const toggle = () => {
    if (!resolved) return;
    if (playing) getEngine().pause();
    else if (isCurrent && engine.status !== 'ended') getEngine().play(resolved.track);
    else play(item, isCurrent ? 0 : cue);
  };

  const seek = (seconds: number) => {
    const clamped = Math.max(0, Math.min(duration, seconds));
    if (isCurrent) getEngine().seek(clamped);
    else setCue(clamped);
  };

  const choose = (next: ListeningItem, options: { speed?: number } = {}) => {
    if (options.speed) getEngine().setRate(options.speed);
    setCue(0);
    play(next, 0);
  };

  const cycleSpeed = () => {
    const index = SPEEDS.indexOf(rate as (typeof SPEEDS)[number]);
    getEngine().setRate(SPEEDS[(index + 1) % SPEEDS.length]);
  };

  const cycleSleep = () => {
    const index = SLEEP_STEPS.findIndex((step) =>
      step.kind === 'minutes' && sleep.kind === 'minutes'
        ? step.minutes === sleep.minutes
        : step.kind === sleep.kind
    );
    const next = SLEEP_STEPS[(index + 1) % SLEEP_STEPS.length];
    setNow(Date.now());
    setSleep(next.kind === 'minutes' ? { ...next, endsAt: Date.now() + next.minutes * 60_000 } : next);
  };

  // Count down a minutes timer, then fade the player out.
  useEffect(() => {
    if (sleep.kind !== 'minutes') return;
    const timer = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= sleep.endsAt) {
        if (getEngine().state.track?.owner === 'player') getEngine().fadeOut();
        setSleep({ kind: 'off' });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [sleep]);

  // At the end of an item, play the next one, unless the sleep timer says stop.
  const sleepRef = useRef(sleep);
  const handledRef = useRef<string | null>(null);
  useEffect(() => {
    sleepRef.current = sleep;
  }, [sleep]);
  useEffect(() => {
    return getEngine().subscribe(() => {
      const { status, track } = getEngine().state;
      if (status !== 'ended' || track?.owner !== 'player') {
        handledRef.current = null;
        return;
      }
      if (handledRef.current === track.clipId) return;
      handledRef.current = track.clipId;
      if (sleepRef.current.kind === 'end') {
        setSleep({ kind: 'off' });
        return;
      }
      const index = listening.findIndex((entry) => entry.id === track.itemId);
      const next = listening[index + 1];
      // After this notification finishes, start the next item.
      if (next) queueMicrotask(() => play(next, 0));
    });
  }, [play]);

  const sleepLabel =
    sleep.kind === 'off'
      ? 'Off'
      : sleep.kind === 'end'
        ? 'End of item'
        : formatRemaining(sleep.endsAt - now);

  return {
    item,
    clip: resolved?.clip,
    playing,
    loading: isCurrent && engine.status === 'loading',
    failed: isCurrent && engine.status === 'error',
    isCurrent,
    time,
    duration,
    rate,
    sleep,
    sleepLabel,
    toggle,
    seek,
    choose,
    cycleSpeed,
    cycleSleep
  };
}

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export type PlayerApi = ReturnType<typeof usePlayer>;
