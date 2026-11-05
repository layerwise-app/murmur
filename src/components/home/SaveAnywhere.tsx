import {
  EmailScreen,
  ExtensionScreen,
  PdfScreen,
  ShareSheetScreen
} from '~/components/screens/SaveScreens';
import { ScreenSlot } from '~/components/screens/ScreenSlot';
import { SectionHeading } from '~/components/site/SectionHeading';
import { home } from '~/content/home';

const labels: Record<string, string> = {
  share: 'A phone share sheet with Murmur as the first destination',
  extension: 'A browser window with the Murmur extension confirming the page is saved',
  email: 'An email being forwarded to a personal Murmur address',
  pdf: 'Murmur on the web reading the pages of an uploaded PDF'
};

export function SaveAnywhere() {
  const copy = home.save;
  return (
    <section
      id='save'
      aria-labelledby='save-heading'
      className='mx-auto max-w-[86rem] px-5 pb-24 sm:px-10 md:pb-36 lg:px-16'
    >
      <SectionHeading id='save-heading' eyebrow={copy.eyebrow} heading={copy.heading} />
      <ul className='mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-16 md:gap-5'>
        {copy.ways.map((way) => (
          <li key={way.id} className='panel flex min-w-0 flex-col p-3 sm:p-4'>
            <div className='aspect-[16/11] overflow-hidden rounded-[1.4rem] hairline'>
              <span className='sr-only'>{labels[way.id]}</span>
              <ScreenSlot media={way.screen} sizes='(min-width: 640px) 45vw, 92vw'>
                <div aria-hidden='true' className='size-full'>
                  {way.id === 'share' ? <ShareSheetScreen /> : null}
                  {way.id === 'extension' ? <ExtensionScreen /> : null}
                  {way.id === 'email' ? <EmailScreen address={('address' in way && way.address) || ''} /> : null}
                  {way.id === 'pdf' ? <PdfScreen /> : null}
                </div>
              </ScreenSlot>
            </div>
            <div className='px-2 pb-3 pt-6 sm:px-3'>
              <h3 className='display-md'>{way.title}</h3>
              <p className='mt-2 max-w-[30rem] text-ink-soft'>{way.sentence}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
