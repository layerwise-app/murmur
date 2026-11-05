import { useEffect, useState } from 'react';
import { Orb } from '~/components/orb/Orb';
import { home } from '~/content/home';
import { getEngine } from '~/lib/audio/engine';
import { useEngineState } from '~/lib/audio/hooks';

export function TalkToOrb() {
  const copy = home.talk;
  const engine = useEngineState();
  const [now, setNow] = useState(0);
  const [hadSession, setHadSession] = useState(false);
  const on = engine.mic === 'on';
  const requesting = engine.mic === 'requesting';
  const remaining =
    on && engine.micEndsAt
      ? Math.min(copy.seconds, Math.max(0, Math.ceil((engine.micEndsAt - now) / 1000)))
      : copy.seconds;

  useEffect(() => {
    if (!on) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [on]);

  // Stop listening when the visitor leaves the page.
  useEffect(() => () => getEngine().stopMic(), []);

  const status =
    engine.mic === 'denied'
      ? copy.denied
      : engine.mic === 'unsupported' || engine.mic === 'error'
        ? copy.unsupported
        : on
          ? `Listening. ${remaining} ${remaining === 1 ? 'second' : 'seconds'} left.`
          : requesting
            ? 'Waiting for your browser’s permission…'
            : hadSession
              ? copy.ended
              : '';
  const progress = on ? remaining / copy.seconds : 0;

  return (
    <section id='talk' aria-labelledby='talk-heading' className='px-3 sm:px-4'>
      <div className='panel relative mx-auto max-w-[86rem] overflow-hidden px-5 py-16 sm:px-10 md:py-24 lg:px-16'>
        <div className='grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16'>
          <div className='order-2 lg:order-1'>
            <p className='eyebrow'>{copy.eyebrow}</p>
            <h2 id='talk-heading' className='display-lg mt-5 max-w-[14ch]'>
              {copy.heading}
            </h2>
            <p className='lede mt-6 max-w-[32rem]'>{copy.body}</p>

            <div className='mt-9 flex flex-col gap-5 sm:flex-row sm:items-center'>
              <button
                type='button'
                onClick={() => {
                  if (on || requesting) {
                    getEngine().stopMic();
                    return;
                  }
                  setHadSession(true);
                  setNow(Date.now());
                  void getEngine().startMic(copy.seconds);
                }}
                aria-describedby='talk-privacy'
                className={`btn relative h-14 shrink-0 px-7 text-[1.0625rem] ${on ? 'btn-quiet bg-cream' : 'btn-primary'}`}
              >
                <span
                  aria-hidden='true'
                  className={`relative flex size-6 items-center justify-center`}
                >
                  <svg viewBox='0 0 36 36' className='absolute inset-0 size-6 -rotate-90'>
                    <circle cx='18' cy='18' r='15' fill='none' stroke='currentColor' strokeOpacity={on ? 0.18 : 0} strokeWidth='3' />
                    <circle
                      cx='18'
                      cy='18'
                      r='15'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='3'
                      strokeLinecap='round'
                      strokeDasharray={`${progress * 94.25} 94.25`}
                      className='transition-[stroke-dasharray] duration-300 ease-linear'
                    />
                  </svg>
                  {on ? (
                    <span className='size-2 rounded-[2px] bg-current' />
                  ) : (
                    <svg viewBox='0 0 24 24' className='size-[1.1rem]'>
                      <rect x='8.5' y='3' width='7' height='12' rx='3.5' fill='currentColor' />
                      <path d='M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
                    </svg>
                  )}
                </span>
                {on || requesting ? copy.stop : copy.start}
              </button>
              <p id='talk-privacy' className='flex max-w-[22rem] items-start gap-2.5 text-[0.95rem] leading-snug text-ink-soft'>
                <svg viewBox='0 0 20 20' className='mt-0.5 size-4 shrink-0' aria-hidden='true'>
                  <path d='M10 2.5 4 5v4.6c0 3.6 2.5 6.8 6 7.9 3.5-1.1 6-4.3 6-7.9V5z' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinejoin='round' />
                  <path d='m7.4 10 1.8 1.8 3.6-3.6' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
                {copy.privacy}
              </p>
            </div>
            <output aria-live='polite' className='mt-5 block min-h-[1.6em] text-[0.95rem] font-medium text-ink'>
              {status}
            </output>
          </div>

          <div className='order-1 flex justify-center lg:order-2'>
            <Orb
              palette='rest'
              label={on ? 'The orb, moving with your voice' : 'The orb, resting'}
              sizes='(min-width: 1024px) 520px, 80vw'
              className='-my-[calc(var(--o)*0.12)] w-[var(--o)] [--o:min(82vw,24rem)] lg:[--o:32rem]'
            />
          </div>
        </div>
      </div>
    </section>
  );
}
