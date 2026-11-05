import { PlayerScreen } from '~/components/player/PlayerScreen';
import { usePlayer } from '~/components/player/usePlayer';
import { PhoneFrame } from '~/components/screens/PhoneFrame';
import { ScreenSlot } from '~/components/screens/ScreenSlot';
import { SectionHeading } from '~/components/site/SectionHeading';
import { home } from '~/content/home';
import { getItem } from '~/content/listening';
import { getVoice } from '~/content/voices';

export function ListenAnywhere() {
  const copy = home.listen;
  const player = usePlayer();

  return (
    <section
      id='listen'
      aria-labelledby='listen-heading'
      className='mx-auto max-w-[86rem] px-5 py-24 sm:px-10 md:py-36 lg:px-16'
    >
      <div className='grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-24 xl:grid-cols-[minmax(0,1fr)_minmax(0,25rem)]'>
        <div>
          <SectionHeading
            id='listen-heading'
            eyebrow={copy.eyebrow}
            heading={copy.heading}
            className='md:!grid-cols-1 md:!items-start md:!gap-6'
          >
            {copy.body}
          </SectionHeading>

          <h3 className='mt-12 text-sm font-semibold text-ink'>{copy.dayHeading}</h3>
          <ol className='mt-4 border-t border-line'>
            {copy.day.map((moment) => {
              const item = getItem(moment.itemId);
              if (!item) return null;
              const voice = getVoice(item.readBy);
              const current = player.item.id === item.id;
              return (
                <li key={moment.time} className='border-b border-line'>
                  <button
                    type='button'
                    onClick={() => player.choose(item, { speed: moment.speed })}
                    aria-current={current ? 'true' : undefined}
                    className='group grid w-full grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-4 py-4 text-left sm:grid-cols-[5.5rem_minmax(0,1fr)_auto]'
                  >
                    <span className='font-display text-[1.35rem] font-[340] tabular-nums text-ink-soft group-aria-[current=true]:text-ink sm:text-2xl'>
                      {moment.time}
                    </span>
                    <span className='min-w-0'>
                      <span className='block font-semibold'>{moment.place}</span>
                      <span className='block truncate text-[0.95rem] text-ink-soft'>
                        {item.title} · {voice?.name} at {moment.speed}×
                      </span>
                    </span>
                    <span
                      aria-hidden='true'
                      className='flex size-10 items-center justify-center rounded-full transition-colors group-hover:bg-ink group-hover:text-cream group-aria-[current=true]:bg-ink group-aria-[current=true]:text-cream'
                      style={{ boxShadow: `inset 0 0 0 1px var(--line)` }}
                    >
                      <svg viewBox='0 0 24 24' className='size-3.5'>
                        <path d='M8 5.2v13.6l11-6.8z' fill='currentColor' />
                      </svg>
                    </span>
                    <span className='sr-only'>
                      Play {item.title} at {moment.speed} times speed
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className='mx-auto w-full max-w-[22.5rem] lg:max-w-none'>
          <PhoneFrame label='Murmur player'>
            <ScreenSlot media={copy.screen}>
              <PlayerScreen player={player} />
            </ScreenSlot>
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}
