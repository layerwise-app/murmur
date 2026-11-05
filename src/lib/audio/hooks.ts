import { useEffect, useReducer, useSyncExternalStore } from 'react';
import { clips, type Clip } from '~/content/listening';
import { getEngine, getServerState, type EngineState } from './engine';

const noopSubscribe = () => () => {};

export function useEngineState(): EngineState {
  return useSyncExternalStore(
    typeof window === 'undefined' ? noopSubscribe : getEngine().subscribe,
    typeof window === 'undefined' ? getServerState : getEngine().getState,
    getServerState
  );
}

/**
 * The current track's position in seconds while `clipId` is the current
 * track: re-rendered every frame while it plays, and on every seek.
 */
export function usePlaybackTime(clipId: string | null): number {
  const state = useEngineState();
  const active = clipId !== null && state.track?.clipId === clipId;
  const playing = active && (state.status === 'playing' || state.status === 'loading');
  const [, frame] = useReducer((count: number) => count + 1, 0);

  useEffect(() => {
    if (!playing) return;
    let id = 0;
    const tick = () => {
      frame();
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing]);

  return active ? getEngine().currentTime : 0;
}

/** The index of the sentence being read at `time`, or -1 before the first. */
export function sentenceAt(clip: Clip | undefined, time: number, started: boolean): number {
  if (!clip || !started) return -1;
  let index = -1;
  for (let i = 0; i < clip.sentences.length; i++) {
    if (time >= clip.sentences[i][0] - 0.06) index = i;
  }
  return index;
}

export function getClip(id: string): Clip | undefined {
  return clips[id];
}

export function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined') return () => {};
      const query = window.matchMedia('(prefers-reduced-motion: reduce)');
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  );
}
