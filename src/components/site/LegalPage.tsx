import type { LegalPage as LegalPageContent } from '~/content/pages';
import { siteConfig } from '~/site.config';

function fill(text: string) {
  return text.replaceAll('{contactEmail}', siteConfig.contactEmail);
}

/** Renders Privacy and Terms: paragraphs, "- " lists, and the contact email as a link. */
function Body({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').map((block, index) => {
        const lines = block.split('\n');
        if (lines.every((line) => line.startsWith('- '))) {
          return (
            <ul key={index} className='mt-4 flex flex-col gap-2.5 first:mt-0'>
              {lines.map((line) => (
                <li key={line} className='flex gap-3'>
                  <span aria-hidden='true' className='mt-[0.7em] size-1.5 shrink-0 rounded-full bg-apricot' />
                  <span>{line.slice(2)}</span>
                </li>
              ))}
            </ul>
          );
        }
        const parts = fill(block).split(siteConfig.contactEmail);
        return (
          <p key={index} className='mt-4 first:mt-0'>
            {parts.flatMap((part, i) =>
              i === 0
                ? [part]
                : [
                    <a key={i} href={`mailto:${siteConfig.contactEmail}`} className='link text-ink'>
                      {siteConfig.contactEmail}
                    </a>,
                    part
                  ]
            )}
          </p>
        );
      })}
    </>
  );
}

export function LegalPage({ content }: { content: LegalPageContent }) {
  return (
    <article className='mx-auto max-w-[86rem] px-5 pb-24 pt-12 sm:px-10 md:pb-32 md:pt-20 lg:px-16'>
      <header className='max-w-3xl'>
        <p className='eyebrow'>{content.eyebrow}</p>
        <h1 className='display-xl mt-5 !text-[clamp(2.5rem,1.6rem+3.6vw,4.5rem)]'>{content.heading}</h1>
        <p className='lede mt-6 max-w-[36rem]'>{content.lede}</p>
        <p className='mt-6 text-sm text-ink-soft'>Last updated {content.updated}</p>
      </header>

      <div className='mt-14 grid gap-12 md:mt-20 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-20'>
        <nav aria-label='On this page' className='hidden lg:block'>
          <ul className='sticky top-24 flex flex-col border-l border-line'>
            {content.sections.map((section, index) => (
              <li key={section.heading}>
                <a
                  href={`#section-${index + 1}`}
                  className='-ml-px flex min-h-10 items-center border-l border-transparent py-1.5 pl-4 text-[0.95rem] text-ink-soft transition-colors hover:border-ink hover:text-ink'
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className='max-w-[42rem]'>
          {content.sections.map((section, index) => (
            <section
              key={section.heading}
              id={`section-${index + 1}`}
              aria-labelledby={`section-${index + 1}-heading`}
              className='border-t border-line py-9 first:border-t-0 first:pt-0'
            >
              <h2 id={`section-${index + 1}-heading`} className='display-md'>
                {section.heading}
              </h2>
              <div className='mt-4 text-[1.0625rem] leading-relaxed text-ink-soft'>
                <Body text={section.body} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
