import { useEffect, useId, useRef, useState } from 'react';
import { PlayPauseIcon } from '~/components/audio/PlayIcon';
import { Cover } from '~/components/screens/Cover';
import { StatusBar } from '~/components/screens/PhoneFrame';
import { listening, sentenceText, wordCount } from '~/content/listening';
import { getVoice } from '~/content/voices';
import { formatTime, sentenceAt } from '~/lib/audio/hooks';
import type { PlayerApi } from './usePlayer';

function formatRate(rate: number) {
  return `${Number.isInteger(rate) ? rate.toFixed(0) : String(rate)}×`;
}

/** Murmur's player screen, drawn in code with the sample queue. */
export function PlayerScreen({ player }: { player: PlayerApi }) {
  const { item, clip, playing, loading, time, duration, rate } = player;
  const voice = getVoice(item.readBy);
  const [reading, setReading] = useState(false);
  const progress = duration ? Math.min(100, (time / duration) * 100) : 0;
  const titleId = useId();

  return (
    <div
      className='flex size-full flex-col text-ink'
      style={{ ['--voice' as string]: voice?.color }}
    >
      <StatusBar />
      <div className='flex h-10 shrink-0 items-center justify-between px-5'>
        <span className='text-[0.78rem] font-semibold text-ink-soft'>Now listening</span>
        <button
          type='button'
          onClick={() => setReading((value) => !value)}
          aria-pressed={reading}
          className={`inline-flex h-8 items-center rounded-full px-3 text-[0.78rem] font-semibold transition-colors ${
            reading ? 'bg-ink text-cream' : 'bg-ink/[0.07] text-ink'
          }`}
        >
          Read along
        </button>
      </div>

      <div className='relative min-h-0 flex-1'>
        {reading ? (
          <ReadAlong player={player} />
        ) : (
          <div className='flex h-full flex-col px-5'>
            {/* The cover takes 64% of the width, or less when a small phone leaves less height. */}
            <div className='flex min-h-0 flex-1 items-center justify-center [container-type:size]'>
              <div className='aspect-square w-[min(64cqw,100cqh)] overflow-hidden rounded-[1.4rem] shadow-[0_18px_40px_-22px_rgba(42,32,27,0.5)]'>
                <Cover kind={item.kind} className='size-full' />
              </div>
            </div>
            <div className='mt-3 shrink-0 text-center'>
              <p id={titleId} className='font-display text-[1.3rem] font-[380] leading-tight'>
                {item.title}
              </p>
              <p className='mt-1 text-[0.8rem] text-ink-soft'>
                {item.source} · read by{' '}
                <span className='font-semibold text-ink'>{voice?.name}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className='shrink-0 px-5 pt-2'>
        <input
          type='range'
          className='scrubber'
          min={0}
          max={duration || 1}
          step={0.1}
          value={Math.min(time, duration || 0)}
          onChange={(event) => player.seek(Number(event.target.value))}
          aria-label={`Position in ${item.title}`}
          aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
          style={{ ['--progress' as string]: `${progress}%` }}
          disabled={!clip}
        />
        <div className='-mt-1 flex justify-between text-[0.72rem] tabular-nums text-ink-soft'>
          <span>{formatTime(time)}</span>
          <span>-{formatTime(Math.max(0, duration - time))}</span>
        </div>

        <div className='mt-1 flex items-center justify-center gap-6'>
          <SkipButton seconds={-10} onClick={() => player.seek(time - 10)} />
          <button
            type='button'
            onClick={player.toggle}
            disabled={!clip}
            aria-label={playing ? `Pause ${item.title}` : `Play ${item.title}`}
            className='flex size-16 items-center justify-center rounded-full bg-ink text-cream transition-transform active:scale-95'
          >
            <PlayPauseIcon playing={playing} loading={loading} className='size-6' />
          </button>
          <SkipButton seconds={10} onClick={() => player.seek(time + 10)} />
        </div>

        <div className='mt-3 flex items-center justify-center gap-2'>
          <button
            type='button'
            onClick={player.cycleSpeed}
            aria-label={`Playback speed ${formatRate(rate)}. Change speed`}
            className='inline-flex h-9 min-w-16 items-center justify-center rounded-full bg-ink/[0.07] px-3 text-[0.8rem] font-semibold tabular-nums'
          >
            {formatRate(rate)}
          </button>
          <button
            type='button'
            onClick={player.cycleSleep}
            aria-label={`Sleep timer: ${player.sleepLabel}. Change sleep timer`}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[0.8rem] font-semibold tabular-nums ${
              player.sleep.kind === 'off' ? 'bg-ink/[0.07]' : 'bg-ink text-cream'
            }`}
          >
            <svg viewBox='0 0 16 16' className='size-3.5' aria-hidden='true'>
              <path d='M10.8 1.6a6.4 6.4 0 1 0 3.6 9.3 5.2 5.2 0 0 1-3.6-9.3z' fill='currentColor' />
            </svg>
            {player.sleep.kind === 'off' ? 'Sleep' : player.sleepLabel}
          </button>
        </div>
      </div>

      <div className='mt-3 shrink-0 border-t border-line px-3 pb-4 pt-2'>
        <p className='px-2 pb-1 text-[0.72rem] font-semibold text-ink-soft'>Queue</p>
        <ol aria-label='Queue'>
          {listening.map((entry) => {
            const current = entry.id === item.id;
            return (
              <li key={entry.id}>
                <button
                  type='button'
                  onClick={() => player.choose(entry)}
                  aria-current={current ? 'true' : undefined}
                  className={`flex w-full items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition-colors ${
                    current ? 'bg-sand' : 'hover:bg-sand/60'
                  }`}
                >
                  <span className='size-9 shrink-0 overflow-hidden rounded-[0.7rem]'>
                    <Cover kind={entry.kind} className='size-full' />
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-[0.8rem] font-semibold leading-tight'>
                      {entry.title}
                    </span>
                    <span className='block truncate text-[0.7rem] text-ink-soft'>
                      {entry.kindLabel} · {wordCount(entry)} words
                    </span>
                  </span>
                  {current && playing ? <Bars /> : null}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function SkipButton({ seconds, onClick }: { seconds: number; onClick: () => void }) {
  const back = seconds < 0;
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={back ? 'Back 10 seconds' : 'Forward 10 seconds'}
      className='relative flex size-11 items-center justify-center rounded-full text-ink hover:bg-ink/[0.06]'
    >
      <svg viewBox='0 0 24 24' className={`size-7 ${back ? '' : '-scale-x-100'}`} aria-hidden='true'>
        <path d='M12 4.5a7.5 7.5 0 1 1-7.1 5.1' fill='none' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round' />
        <path d='M4.2 4.6v5.3h5.3' fill='none' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
      <span className='absolute pt-1 text-[0.6rem] font-bold'>10</span>
    </button>
  );
}

function Bars() {
  return (
    <span className='mr-1 flex h-3.5 items-end gap-[2px]' aria-label='Playing'>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className='w-[3px] origin-bottom rounded-full bg-ink motion-safe:animate-[murmur-bar_1s_ease-in-out_infinite]'
          style={{ height: '100%', animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  );
}

/** Where each paragraph's sentences start, counting from the top of the item. */
function paragraphStarts(body: unknown[][]) {
  const starts: number[] = [];
  let total = 0;
  for (const paragraph of body) {
    starts.push(total);
    total += paragraph.length;
  }
  return starts;
}

function ReadAlong({ player }: { player: PlayerApi }) {
  const { item, clip, time, isCurrent, playing } = player;
  const scroller = useRef<HTMLElement>(null);
  const active = sentenceAt(clip, time, isCurrent && (playing || time > 0));
  const starts = paragraphStarts(item.body);

  // Keep the sentence being read in view inside the phone, not the page.
  useEffect(() => {
    const box = scroller.current;
    if (!box || active < 0) return;
    const node = box.querySelector<HTMLElement>('[aria-current="true"]');
    if (!node) return;
    const top = node.offsetTop - box.clientHeight * 0.3;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    box.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
  }, [active]);

  return (
    <section
      ref={scroller}
      aria-label={`Text of ${item.title}`}
      className='absolute inset-0 overflow-y-auto overscroll-contain px-6 pb-6 [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_88%,transparent)]'
    >
      <p className='font-display pt-3 text-[1.15rem] font-[380] leading-tight'>{item.title}</p>
      <p className='mb-3 text-[0.72rem] text-ink-soft'>{item.byline}</p>
      {item.body.map((paragraph, p) => (
        <p key={p} className='mb-3 text-[0.86rem] leading-relaxed'>
          {paragraph.map((sentence, s) => {
            const index = starts[p] + s;
            const now = index === active;
            const outside = index >= item.sampleSentences;
            return (
              <span key={index}>
                <span
                  aria-current={now ? 'true' : undefined}
                  className={`rounded px-[1px] transition-colors duration-500 ${
                    now
                      ? 'bg-[color-mix(in_srgb,var(--voice)_32%,transparent)]'
                      : outside
                        ? 'text-ink-soft'
                        : ''
                  }`}
                >
                  {sentenceText(sentence)}
                </span>{' '}
              </span>
            );
          })}
        </p>
      ))}
    </section>
  );
}
