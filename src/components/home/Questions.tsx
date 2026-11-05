import { home } from '~/content/home';
import { faq } from '~/content/faq';
import { SmartLink } from '~/components/site/SmartLink';

export function Questions() {
  const copy = home.questions;
  return (
    <section
      id='questions'
      aria-labelledby='questions-heading'
      className='mx-auto max-w-[86rem] px-5 py-24 sm:px-10 md:py-36 lg:px-16'
    >
      <div className='grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20'>
        <div>
          <p className='eyebrow'>{copy.eyebrow}</p>
          <h2 id='questions-heading' className='display-lg mt-5'>
            {copy.heading}
          </h2>
        </div>
        <div className='border-t border-line'>
          {faq.map((entry) => (
            <details key={entry.question} className='faq group border-b border-line'>
              <summary className='flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left'>
                <span className='font-display text-[1.3rem] font-[360] leading-snug sm:text-[1.45rem]'>
                  {entry.question}
                </span>
                <span
                  aria-hidden='true'
                  className='relative flex size-9 shrink-0 items-center justify-center rounded-full hairline transition-colors group-open:bg-ink group-open:text-cream'
                >
                  <span className='absolute h-[1.5px] w-3.5 rounded-full bg-current' />
                  <span className='absolute h-3.5 w-[1.5px] rounded-full bg-current transition-transform duration-300 group-open:rotate-90 group-open:opacity-0' />
                </span>
              </summary>
              <div className='max-w-[40rem] pb-7 pr-12 text-ink-soft'>
                {entry.answer.split('\n\n').map((paragraph) => (
                  <p key={paragraph} className='mt-3 first:mt-0'>
                    <RichText text={paragraph} />
                  </p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Plain text with [words](/path) links. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/);
  return (
    <>
      {parts.map((part, i) => {
        const match = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        return match ? (
          <SmartLink key={i} href={match[2]} className='link text-ink'>
            {match[1]}
          </SmartLink>
        ) : (
          part
        );
      })}
    </>
  );
}
