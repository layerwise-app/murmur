import { useEffect, useRef, useState } from 'react';
import { getVoice, restingOrb } from '~/content/voices';
import { useEngineState, usePrefersReducedMotion } from '~/lib/audio/hooks';
import type { OrbLook, OrbRenderer } from './orb-gl';

type OrbProps = {
  /** `auto` follows the voice that is playing (or played last). */
  palette?: 'auto' | 'rest' | string;
  /** Respond to the voice samples and the microphone. */
  reactive?: boolean;
  /** A dim, slow orb, for the 404 page. */
  quiet?: boolean;
  /** Load the still with high priority (above the fold). */
  priority?: boolean;
  /** Width the orb is shown at, for choosing the still image size. */
  sizes?: string;
  className?: string;
  label?: string;
  /** Only start WebGL when this media query matches, like `(min-width: 1024px)`. */
  media?: string;
};

export function lookFor(voiceId: string | null): OrbLook {
  const voice = voiceId ? getVoice(voiceId) : undefined;
  const source = voice ?? restingOrb;
  return { ...source.orb, ...source.texture };
}

function stillName(voiceId: string | null, quiet: boolean) {
  if (quiet) return 'quiet';
  return voiceId && getVoice(voiceId) ? voiceId : 'rest';
}

let glModule: Promise<typeof import('./orb-gl')> | null = null;
function loadGl() {
  glModule ??= import('./orb-gl');
  return glModule;
}

/** Waits until the page has painted and the main thread is free. */
function afterFirstPaint(callback: () => void) {
  let cancelled = false;
  const run = () => {
    if (cancelled) return;
    const idle = (window as { requestIdleCallback?: (cb: () => void, o?: object) => number })
      .requestIdleCallback;
    if (idle) idle(() => !cancelled && callback(), { timeout: 1500 });
    else setTimeout(() => !cancelled && callback(), 200);
  };
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener('load', run);
  };
}

export function Orb({
  palette = 'auto',
  reactive = true,
  quiet = false,
  priority = false,
  sizes = '(min-width: 768px) 560px, 80vw',
  className = '',
  label,
  media
}: OrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<OrbRenderer | null>(null);
  const [live, setLive] = useState(false);
  const engine = useEngineState();
  const reducedMotion = usePrefersReducedMotion();
  const voiceId = palette === 'auto' ? engine.voiceId : palette === 'rest' ? null : palette;
  const name = stillName(voiceId, quiet);
  const lookRef = useRef(lookFor(voiceId));
  lookRef.current = lookFor(voiceId);

  // Start WebGL after first paint; pause it off screen and in hidden tabs.
  useEffect(() => {
    if (reducedMotion) return;
    if (media && !window.matchMedia(media).matches) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    let visible = false;
    let destroyed = false;
    const sync = () => {
      const renderer = rendererRef.current;
      if (!renderer) return;
      if (visible && document.visibilityState === 'visible') renderer.start();
      else renderer.stop();
    };
    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { rootMargin: '120px' }
    );
    intersection.observe(wrap);
    document.addEventListener('visibilitychange', sync);
    const cancel = afterFirstPaint(() => {
      void loadGl().then(({ createOrbRenderer }) => {
        if (destroyed) return;
        rendererRef.current = createOrbRenderer(canvas, {
          look: lookRef.current,
          quiet,
          reactive,
          onFirstFrame: () => setLive(true)
        });
        sync();
      });
    });
    return () => {
      destroyed = true;
      cancel();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', sync);
      rendererRef.current?.destroy();
      rendererRef.current = null;
      setLive(false);
    };
    // The renderer is created once; look and flags are pushed below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  useEffect(() => {
    rendererRef.current?.setLook(lookFor(voiceId));
  }, [voiceId, live]);

  useEffect(() => {
    rendererRef.current?.setQuiet(quiet);
    rendererRef.current?.setReactive(reactive);
  }, [quiet, reactive, live]);

  return (
    <div
      ref={wrapRef}
      className={`relative aspect-square select-none ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <picture>
        <source
          type='image/avif'
          srcSet={`/orb/${name}-512.avif 512w, /orb/${name}-1024.avif 1024w`}
          sizes={sizes}
        />
        <img
          src={`/orb/${name}-1024.webp`}
          srcSet={`/orb/${name}-512.webp 512w, /orb/${name}-1024.webp 1024w`}
          sizes={sizes}
          width={1024}
          height={1024}
          alt=''
          decoding='async'
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
          draggable={false}
          className={`absolute inset-0 size-full transition-opacity duration-700 ease-out ${live ? 'opacity-0' : 'opacity-100'}`}
        />
      </picture>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 size-full transition-opacity duration-700 ease-out ${live ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
