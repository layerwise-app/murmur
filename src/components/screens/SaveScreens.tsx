import { LogoMark } from '~/components/site/Logo';
import { getItem, wordCount } from '~/content/listening';
import { getVoice } from '~/content/voices';
import { Cover } from './Cover';

const essay = getItem('street-trees')!;
const newsletter = getItem('small-hours')!;
const report = getItem('canopy-survey')!;

function Lines({ widths, className = 'bg-ink/12' }: { widths: number[]; className?: string }) {
  return (
    <div className='flex flex-col gap-1.5'>
      {widths.map((width, i) => (
        <span key={i} className={`block h-1.5 rounded-full ${className}`} style={{ width: `${width}%` }} />
      ))}
    </div>
  );
}

/** Phone share sheet with Murmur as a destination. */
export function ShareSheetScreen() {
  return (
    <div className='relative size-full overflow-hidden bg-[#f3e9dc] p-5 text-ink'>
      <p className='text-[0.7rem] font-semibold text-ink-soft'>{essay.source}</p>
      <p className='font-display mt-1 text-[1.15rem] font-[380] leading-tight'>{essay.title}</p>
      <div className='mt-3'>
        <Lines widths={[96, 88, 92, 70, 94, 84]} />
      </div>
      <div className='absolute inset-x-3 bottom-3 rounded-[1.25rem] bg-cream p-4 shadow-[0_-12px_30px_-18px_rgba(42,32,27,0.45)]'>
        <div className='mx-auto mb-3 h-1 w-9 rounded-full bg-ink/15' />
        <div className='grid grid-cols-4 gap-2 text-center text-[0.68rem] font-medium'>
          <div className='flex flex-col items-center gap-1.5'>
            <span className='relative flex size-11'>
              <LogoMark className='size-11' />
              <span className='absolute -inset-1.5 rounded-[1.1rem] ring-2 ring-apricot' />
            </span>
            <span className='font-semibold'>Murmur</span>
          </div>
          {['Notes', 'Mail', 'Copy'].map((label, i) => (
            <div key={label} className='flex flex-col items-center gap-1.5 text-ink-soft'>
              <span
                className='size-11 rounded-[0.85rem]'
                style={{ background: ['#e4d4be', '#ead9c5', '#efe4d4'][i] }}
              />
              {label}
            </div>
          ))}
        </div>
        <div className='mt-3 rounded-xl bg-sand px-3 py-2 text-[0.7rem] font-semibold'>Add to Murmur queue</div>
      </div>
    </div>
  );
}

/** Browser window with the Murmur extension's saved popup. */
export function ExtensionScreen() {
  const theo = getVoice(essay.readBy)!;
  const minutes = Math.round(wordCount(essay) / 150);
  return (
    <div className='relative size-full overflow-hidden bg-[#fbf7f1] text-ink'>
      <div className='flex h-10 items-center gap-2 border-b border-line bg-sand px-3'>
        <span className='flex gap-1.5' aria-hidden='true'>
          <span className='size-2.5 rounded-full bg-[#d8857a]' />
          <span className='size-2.5 rounded-full bg-[#f0a46c]' />
          <span className='size-2.5 rounded-full bg-[#9fb28f]' />
        </span>
        <span className='ml-1 min-w-0 flex-1 truncate rounded-full bg-cream px-3 py-1 text-[0.66rem] text-ink-soft'>
          thelongfield.example/essays/the-shade-we-inherit
        </span>
        <span className='flex size-7 rounded-[0.45rem] ring-2 ring-apricot ring-offset-1 ring-offset-sand'>
          <LogoMark className='size-7' />
        </span>
      </div>
      <div className='p-5'>
        <p className='text-[0.66rem] font-semibold uppercase tracking-wider text-ink-soft'>Essay</p>
        <p className='font-display mt-1 text-[1.1rem] font-[380] leading-tight'>{essay.title}</p>
        <div className='mt-3 w-[70%]'>
          <Lines widths={[100, 94, 98, 76, 90]} />
        </div>
      </div>
      <div className='absolute right-3 top-12 w-[62%] rounded-[1.1rem] bg-cream p-3.5 shadow-[0_18px_40px_-16px_rgba(42,32,27,0.45)] hairline'>
        <p className='flex items-center gap-1.5 text-[0.72rem] font-semibold'>
          <svg viewBox='0 0 16 16' className='size-3.5 text-[#647f5c]' aria-hidden='true'>
            <path d='M3 8.5l3.2 3L13 4.5' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
          Saved to Murmur
        </p>
        <p className='mt-1 text-[0.68rem] leading-snug text-ink-soft'>
          {wordCount(essay)} words, about {minutes} minutes with {theo.name}
        </p>
        <span className='mt-2.5 inline-flex h-7 items-center rounded-full bg-ink px-3 text-[0.68rem] font-semibold text-cream'>
          Play now
        </span>
      </div>
    </div>
  );
}

/** An email being forwarded to a personal Murmur address. */
export function EmailScreen({ address }: { address: string }) {
  return (
    <div className='relative size-full overflow-hidden bg-[#fbf7f1] p-4 text-ink'>
      <div className='rounded-[1rem] bg-cream p-4 hairline'>
        <div className='flex items-center justify-between border-b border-line pb-2 text-[0.7rem]'>
          <span className='font-semibold'>Forward</span>
          <span className='rounded-full bg-ink px-2.5 py-1 text-[0.64rem] font-semibold text-cream'>Send</span>
        </div>
        <p className='border-b border-line py-2 text-[0.7rem]'>
          <span className='text-ink-soft'>To </span>
          <span className='rounded-full bg-[color-mix(in_srgb,var(--apricot)_28%,transparent)] px-2 py-0.5 font-semibold'>
            {address}
          </span>
        </p>
        <p className='border-b border-line py-2 text-[0.7rem]'>
          <span className='text-ink-soft'>Subject </span>
          <span className='font-semibold'>Fwd: {newsletter.source}</span>
        </p>
        <div className='flex gap-3 pt-3'>
          <span className='size-12 shrink-0 overflow-hidden rounded-lg'>
            <Cover kind='newsletter' className='size-full' />
          </span>
          <div className='flex-1 pt-1'>
            <Lines widths={[92, 80, 86, 54]} />
          </div>
        </div>
      </div>
      <p className='absolute inset-x-6 bottom-4 rounded-full bg-sand px-3 py-2 text-center text-[0.68rem] font-semibold'>
        Ready to play in your queue in a few seconds
      </p>
    </div>
  );
}

/** Murmur on the web, reading an uploaded PDF. */
export function PdfScreen() {
  const mei = getVoice(report.readBy)!;
  return (
    <div className='relative size-full overflow-hidden bg-[#fbf7f1] p-4 text-ink'>
      <div className='flex h-full flex-col items-center justify-center rounded-[1rem] border-2 border-dashed border-ink/20 p-4'>
        <div className='w-full max-w-[17rem] rounded-[1rem] bg-cream p-3.5 shadow-[0_16px_36px_-20px_rgba(42,32,27,0.45)] hairline'>
          <div className='flex items-center gap-3'>
            <span className='relative flex h-12 w-10 shrink-0 items-end justify-center rounded-md bg-[#eef0dc] pb-1 text-[0.55rem] font-bold text-[#4c6346]'>
              <span className='absolute right-0 top-0 size-3 rounded-bl-md bg-[#d7dcc0]' />
              PDF
            </span>
            <span className='min-w-0'>
              <span className='block truncate text-[0.72rem] font-semibold'>canopy-survey-2026.pdf</span>
              <span className='block text-[0.66rem] text-ink-soft'>14 pages · {report.byline}</span>
            </span>
          </div>
          <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10'>
            <div className='h-full w-[64%] rounded-full bg-[#647f5c]' />
          </div>
          <p className='mt-1.5 flex justify-between text-[0.64rem] text-ink-soft'>
            <span>Reading page 9 of 14</span>
            <span>Skipping footnotes</span>
          </p>
        </div>
        <p className='mt-4 text-[0.68rem] text-ink-soft'>
          {mei.name} will read it when it’s ready
        </p>
      </div>
    </div>
  );
}
