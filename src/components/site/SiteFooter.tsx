import { siteConfig } from '~/site.config';
import { Wordmark } from './Logo';
import { SmartLink } from './SmartLink';

export function SiteFooter() {
  const social = siteConfig.social.filter((item) => item.href);
  const year = 2026;
  return (
    <footer className='px-3 pb-3 sm:px-4 sm:pb-4'>
      <div className='panel mx-auto max-w-[86rem] px-6 pb-8 pt-12 sm:px-10 sm:pt-16'>
        <div className='grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]'>
          <div className='max-w-sm'>
            <Wordmark />
            <p className='mt-5 text-ink-soft'>
              {siteConfig.tagline} Made by {siteConfig.company}, a twelve-person team in{' '}
              {siteConfig.companyLocation.split(',')[0]}.
            </p>
            <SmartLink href={siteConfig.cta.href} className='btn btn-primary mt-7'>
              {siteConfig.cta.label}
            </SmartLink>
          </div>

          <nav aria-label='Site'>
            <h2 className='text-sm font-semibold text-ink'>{siteConfig.product}</h2>
            <ul className='mt-3'>
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <SmartLink
                    href={item.href}
                    className='inline-flex min-h-11 items-center text-ink-soft transition-colors hover:text-ink'
                  >
                    {item.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label='Company'>
            <h2 className='text-sm font-semibold text-ink'>{siteConfig.company}</h2>
            <ul className='mt-3'>
              {siteConfig.footerLinks
                .filter((item) => item.href !== '/voices')
                .map((item) => (
                  <li key={item.href}>
                    <SmartLink
                      href={item.href}
                      className='inline-flex min-h-11 items-center text-ink-soft transition-colors hover:text-ink'
                    >
                      {item.label}
                    </SmartLink>
                  </li>
                ))}
              <li>
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className='inline-flex min-h-11 items-center text-ink-soft transition-colors hover:text-ink'
                >
                  {siteConfig.contactEmail}
                </a>
              </li>
              {social.map((item) => (
                <li key={item.label}>
                  <SmartLink
                    href={item.href}
                    className='inline-flex min-h-11 items-center text-ink-soft transition-colors hover:text-ink'
                  >
                    {item.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className='mt-14 flex flex-col-reverse gap-5 border-t border-line pt-6 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between'>
          <p>
            © {year} {siteConfig.companyLegalName}, {siteConfig.companyLocation}.
          </p>
          <a
            href='https://layerwise.app'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex w-fit rounded-md'
          >
            <img
              src='https://layerwise.app/powered-by.png'
              width={174}
              height={28}
              loading='lazy'
              decoding='async'
              alt='Powered by Layerwise'
              className='h-7 w-[174px]'
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
