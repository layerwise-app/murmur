import { createFileRoute } from '@tanstack/react-router';
import { Captions } from '~/components/audio/Captions';
import { PlayPauseIcon } from '~/components/audio/PlayIcon';
import { Orb } from '~/components/orb/Orb';
import { SmartLink } from '~/components/site/SmartLink';
import { clipId, clips, getItem, itemSentences } from '~/content/listening';
import { voicesPage } from '~/content/pages';
import { getVoice, voices, type Voice } from '~/content/voices';
import { getEngine } from '~/lib/audio/engine';
import { formatTime, sentenceAt, useEngineState, usePlaybackTime } from '~/lib/audio/hooks';
import { siteConfig } from '~/site.config';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/voices')({
  head: () =>
    seo({
      title: voicesPage.seo.title,
      description: voicesPage.seo.description,
      path: '/voices',
      image: '/og/voices.png',
      imageAlt: voicesPage.heading
    }),
  component: VoicesPage
});

function VoicesPage() {
  const engine = useEngineState();
  const current = engine.track?.owner === 'voices' ? getVoice(engine.track.voiceId) : undefined;

  return (
    <div style={{ ['--voice' as string]: current?.color ?? 'var(--apricot)' }}>
      <header className='mx-auto max-w-[86rem] px-5 pt-12 sm:px-10 md:pt-20 lg:px-16'>
        <p className='eyebrow'>{voicesPage.eyebrow}</p>
        <h1 className='display-xl mt-5 max-w-[15ch]'>{voicesPage.heading}</h1>
        <p className='lede mt-6 max-w-[38rem]'>{voicesPage.lede}</p>
        <nav aria-label='Voices on this page' className='mt-8'>
          <ul className='flex flex-wrap gap-2'>
            {(voices as readonly Voice[]).map((voice) => (
              <li key={voice.id}>
                <a
                  href={`#${voice.id}`}
                  className='inline-flex h-11 items-center gap-2 rounded-full bg-sand px-4 font-medium transition-colors hover:bg-sand-deep'
                >
                  <span aria-hidden='true' className='size-2.5 rounded-full' style={{ background: voice.color }} />
                  {voice.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className='mx-auto mt-14 grid max-w-[86rem] gap-6 px-3 sm:px-4 md:mt-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10 lg:px-16'>
        <div className='hidden lg:block'>
          <div className='sticky top-20 flex flex-col items-center'>
            <Orb
              media='(min-width: 1024px)'
              label={current ? `The orb, coloured for ${current.name}` : 'The orb, waiting for a voice'}
              sizes='520px'
              className='w-full max-w-[32rem]'
            />
            <p className='-mt-10 max-w-[22rem] text-center text-sm text-ink-soft'>
              {current ? `${current.name}: ${current.character.toLowerCase()}` : 'Press play on any voice'}
            </p>
          </div>
        </div>

        <div className='flex flex-col gap-4'>
          {(voices as readonly Voice[]).map((voice) => (
            <VoiceDetail key={voice.id} voice={voice} />
          ))}
          <p className='px-4 py-6 text-sm text-ink-soft sm:px-8'>{voicesPage.samplesNote}</p>
        </div>
      </div>

      <section
        aria-labelledby='voices-closing'
        className='mx-auto flex max-w-[86rem] flex-col items-start gap-6 px-5 py-24 sm:px-10 md:flex-row md:items-end md:justify-between md:py-32 lg:px-16'
      >
        <div>
          <h2 id='voices-closing' className='display-lg max-w-[18ch]'>
            {voicesPage.closing.heading}
          </h2>
          <p className='lede mt-5 max-w-[32rem]'>{voicesPage.closing.body}</p>
        </div>
        <SmartLink href={siteConfig.cta.href} className='btn btn-primary h-14 px-8 text-[1.0625rem]'>
          {siteConfig.cta.label}
        </SmartLink>
      </section>
    </div>
  );
}

function VoiceDetail({ voice }: { voice: Voice }) {
  const engine = useEngineState();
  const item = getItem(voice.longSample);
  const id = item ? clipId.item(item.id, voice.id) : '';
  const clip = clips[id];
  const isCurrent = engine.track?.clipId === id && engine.track.owner === 'voices';
  const playing = isCurrent && (engine.status === 'playing' || engine.status === 'loading');
  const time = usePlaybackTime(isCurrent ? id : null);
  const sentences = item ? itemSentences(item).slice(0, item.sampleSentences) : [];
  const ended = isCurrent && engine.status === 'ended';
  const active = ended ? sentences.length : sentenceAt(clip, time, isCurrent && engine.status !== 'idle');

  const toggle = () => {
    if (!clip) return;
    getEngine().toggle({ clipId: id, src: clip.src, voiceId: voice.id, owner: 'voices', itemId: item?.id });
  };

  return (
    <section
      id={voice.id}
      aria-labelledby={`${voice.id}-name`}
      className='panel scroll-mt-24 p-6 sm:p-10'
      style={{ ['--c' as string]: voice.color }}
    >
      <div className='flex items-start gap-5'>
        <img
          src={`/orb/${voice.id}-160.webp`}
          alt=''
          width={80}
          height={80}
          loading='lazy'
          decoding='async'
          className='size-16 shrink-0 scale-[1.5] sm:size-20 lg:hidden'
        />
        <div>
          <h2 id={`${voice.id}-name`} className='display-lg'>
            {voice.name}
          </h2>
          <p className='mt-1 text-lg font-semibold'>{voice.character}</p>
        </div>
      </div>
      <p className='font-display mt-6 text-[1.35rem] font-[340] leading-snug'>{voice.line}</p>
      <p className='mt-4 max-w-[38rem] text-ink-soft'>{voice.about}</p>

      <h3 className='mt-7 text-sm font-semibold'>{voicesPage.goodFor}</h3>
      <ul className='mt-3 flex flex-wrap gap-2'>
        {voice.goodFor.map((use) => (
          <li key={use} className='rounded-full bg-cream/70 px-3.5 py-1.5 text-[0.95rem] hairline'>
            {use}
          </li>
        ))}
      </ul>

      {item ? (
        <figure className='mt-8 rounded-[1.5rem] bg-cream/80 p-5 hairline sm:p-7'>
          <div className='flex items-center gap-4'>
            <button
              type='button'
              onClick={toggle}
              disabled={!clip}
              className='flex size-12 shrink-0 items-center justify-center rounded-full bg-ink text-cream disabled:opacity-50'
              aria-label={`${playing ? 'Pause' : 'Play'} ${voice.name} reading ${item.title}`}
            >
              <PlayPauseIcon playing={playing} loading={isCurrent && engine.status === 'loading'} className='size-5' />
            </button>
            <figcaption className='min-w-0 flex-1 text-sm text-ink-soft'>
              <span className='block'>
                {voicesPage.reading} <cite className='font-semibold not-italic text-ink'>{item.title}</cite>
              </span>
              <span className='block'>
                {item.source}
                {clip ? ` · ${formatTime(isCurrent ? time : 0)} / ${formatTime(clip.duration)}` : ' · sample coming soon'}
              </span>
            </figcaption>
          </div>
          <div aria-hidden='true' className='mt-4 h-[3px] overflow-hidden rounded-full bg-ink/10'>
            <div
              className='h-full origin-left rounded-full bg-[var(--c)]'
              style={{ transform: `scaleX(${clip && isCurrent ? Math.min(1, time / clip.duration) : 0})` }}
            />
          </div>
          <Captions
            sentences={sentences}
            active={active}
            color={voice.color}
            className='mt-5 text-[1.0625rem] leading-relaxed'
          />
        </figure>
      ) : null}
    </section>
  );
}
