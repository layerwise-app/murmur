import { Captions } from '~/components/audio/Captions';
import { PlayPauseIcon } from '~/components/audio/PlayIcon';
import { Orb } from '~/components/orb/Orb';
import { SectionHeading } from '~/components/site/SectionHeading';
import { SmartLink } from '~/components/site/SmartLink';
import { home } from '~/content/home';
import {
  clipId,
  clips,
  getItem,
  itemSentences,
  pickerSample
} from '~/content/listening';
import { getVoice, voices, type Voice } from '~/content/voices';
import { getEngine } from '~/lib/audio/engine';
import {
  formatTime,
  sentenceAt,
  useEngineState,
  usePlaybackTime
} from '~/lib/audio/hooks';

export function VoicePicker() {
  const copy = home.voices;
  const engine = useEngineState();
  const item = getItem(pickerSample.itemId)!;
  const sentences = itemSentences(item).slice(0, pickerSample.sentences);

  const pickerTrack = engine.track?.owner === 'picker' ? engine.track : null;
  const activeVoice = pickerTrack ? getVoice(pickerTrack.voiceId) : undefined;
  const activeClip = pickerTrack ? clips[pickerTrack.clipId] : undefined;
  const time = usePlaybackTime(pickerTrack?.clipId ?? null);
  const ended = pickerTrack !== null && engine.status === 'ended';
  const active = ended
    ? sentences.length
    : sentenceAt(activeClip, time, pickerTrack !== null && engine.status !== 'idle');

  return (
    <section id='voices' aria-labelledby='voices-heading' className='px-3 sm:px-4'>
      <div
        className='panel mx-auto max-w-[86rem] px-5 py-16 sm:px-10 md:py-24 lg:px-16'
        style={{ ['--voice' as string]: activeVoice?.color ?? 'var(--apricot)' }}
      >
        <SectionHeading id='voices-heading' eyebrow={copy.eyebrow} heading={copy.heading}>
          {copy.body}
        </SectionHeading>

        <div className='mt-10 grid items-center gap-6 md:mt-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16'>
          <div className='lg:col-start-2 lg:row-start-1'>
            <ul className='grid grid-cols-2 gap-2 sm:gap-3 lg:flex lg:flex-col' aria-label='Voices'>
              {(voices as readonly Voice[]).map((voice) => (
                <li key={voice.id}>
                  <VoiceCard voice={voice} />
                </li>
              ))}
            </ul>
            <MoreLink className='mt-6 hidden lg:inline-flex' />
          </div>

          <div className='flex flex-col items-center lg:col-start-1 lg:row-start-1'>
            <Orb
              label={
                activeVoice
                  ? `The orb, coloured for ${activeVoice.name}`
                  : 'The orb, waiting for a voice'
              }
              sizes='(min-width: 1024px) 460px, 70vw'
              className='-mb-[calc(var(--o)*0.13)] -mt-[calc(var(--o)*0.15)] w-[var(--o)] [--o:min(66vw,20rem)] sm:[--o:24rem] lg:[--o:29rem]'
            />
            <figure className='relative w-full max-w-xl rounded-[1.75rem] bg-cream/80 p-5 hairline sm:p-8'>
              <figcaption className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm text-ink-soft'>
                <span>
                  {activeVoice ? (
                    <>
                      <span className='font-semibold text-ink'>{activeVoice.name}</span> reading{' '}
                    </>
                  ) : null}
                  <cite className='not-italic'>“{item.title}”</cite> by {item.byline}
                </span>
                <span className='tabular-nums'>
                  {activeClip
                    ? `${formatTime(time)} / ${formatTime(activeClip.duration)}`
                    : copy.idleCaption}
                </span>
              </figcaption>
              <Captions
                sentences={sentences}
                active={active}
                color={activeVoice?.color ?? 'var(--apricot)'}
                className='font-display mt-3 text-[1.25rem] font-[340] leading-[1.45] sm:mt-4 sm:text-[1.55rem]'
              />
            </figure>
            <MoreLink className='mt-5 self-start lg:hidden' />
          </div>
        </div>
      </div>
    </section>
  );
}

function MoreLink({ className }: { className: string }) {
  const { more } = home.voices;
  return (
    <SmartLink href={more.href} className={`link min-h-11 items-center gap-2 font-semibold ${className}`}>
      {more.label}
      <span aria-hidden='true'>→</span>
    </SmartLink>
  );
}

function VoiceCard({ voice }: { voice: Voice }) {
  const engine = useEngineState();
  const id = clipId.opening(voice.id);
  const clip = clips[id];
  const isCurrent = engine.track?.clipId === id;
  const playing = isCurrent && (engine.status === 'playing' || engine.status === 'loading');
  const loading = isCurrent && engine.status === 'loading';
  const time = usePlaybackTime(isCurrent ? id : null);
  const progress = clip && isCurrent ? Math.min(1, time / clip.duration) : 0;
  const failed = isCurrent && engine.status === 'error';

  return (
    <button
      type='button'
      disabled={!clip}
      onClick={() =>
        clip &&
        getEngine().toggle({ clipId: id, src: clip.src, voiceId: voice.id, owner: 'picker' })
      }
      className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-[1.25rem] p-2.5 pr-3 text-left transition-[background-color,box-shadow] duration-300 sm:gap-4 sm:rounded-[1.5rem] sm:p-4 sm:pr-5 ${
        isCurrent
          ? 'bg-cream shadow-[inset_0_0_0_1.5px_var(--c)]'
          : 'bg-cream/45 hairline hover:bg-cream/80'
      } disabled:cursor-not-allowed disabled:opacity-60`}
      style={{ ['--c' as string]: voice.color }}
    >
      <span className='relative size-11 shrink-0 sm:size-16'>
        <img
          src={`/orb/${voice.id}-160.webp`}
          alt=''
          width={64}
          height={64}
          loading='lazy'
          decoding='async'
          className='size-full scale-[1.5]'
        />
        <span
          aria-hidden='true'
          className={`absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full sm:hidden ${
            isCurrent ? 'bg-ink text-cream' : 'bg-cream text-ink shadow-[0_0_0_1px_var(--line)]'
          }`}
        >
          <PlayPauseIcon playing={playing} loading={loading} className='size-3' />
        </span>
      </span>
      <span className='min-w-0 flex-1'>
        <span className='sr-only'>{playing ? 'Pause' : 'Play'} </span>
        <span className='font-display block text-[1.2rem] font-[360] leading-tight sm:text-[1.55rem]'>
          {voice.name}
        </span>
        <span className='block text-[0.8rem] leading-snug text-ink-soft sm:text-[0.95rem]'>
          {voice.character}
          <span className='sr-only'>.</span>
        </span>
        {failed ? (
          <span className='block text-sm text-error'>Couldn’t load this sample. Try again.</span>
        ) : null}
      </span>
      <span className='hidden text-sm tabular-nums text-ink-soft md:block' aria-hidden='true'>
        {clip ? formatTime(isCurrent ? time : clip.duration) : 'No sample yet'}
      </span>
      <span
        className={`hidden size-11 shrink-0 items-center justify-center rounded-full transition-colors duration-300 sm:flex ${
          isCurrent ? 'bg-ink text-cream' : 'bg-ink/[0.07] text-ink group-hover:bg-ink group-hover:text-cream'
        }`}
        aria-hidden='true'
      >
        <PlayPauseIcon playing={playing} loading={loading} />
      </span>
      <span
        aria-hidden='true'
        className='absolute inset-x-4 bottom-0 h-[3px] origin-left rounded-full bg-[var(--c)]'
        style={{ transform: `scaleX(${progress})`, opacity: isCurrent ? 1 : 0 }}
      />
    </button>
  );
}
