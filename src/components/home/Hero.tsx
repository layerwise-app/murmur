import { Orb } from '~/components/orb/Orb';
import { SmartLink } from '~/components/site/SmartLink';
import { home } from '~/content/home';
import { siteConfig } from '~/site.config';

export function Hero() {
  const { hero } = home;
  return (
    <section
      aria-labelledby='hero-heading'
      className='relative overflow-hidden px-5 pb-16 pt-8 sm:px-8 sm:pt-10 md:pb-24'
    >
      {/* A wide, faint wash of warm light behind everything. */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60rem] bg-[radial-gradient(75%_62%_at_50%_44%,color-mix(in_srgb,var(--sand)_90%,transparent)_0%,color-mix(in_srgb,var(--sand)_40%,transparent)_42%,transparent_78%)]'
      />
      <div className='mx-auto flex max-w-5xl flex-col items-center text-center'>
        <p className='eyebrow'>{hero.eyebrow}</p>
        <h1 id='hero-heading' className='display-xl mt-5 max-w-[14ch] sm:max-w-[17ch]'>
          {hero.headline}
        </h1>

        <Orb
          priority
          label={`${siteConfig.product}'s orb, breathing slowly`}
          sizes='(min-width: 768px) 560px, 92vw'
          className='my-[calc(var(--orb)*-0.135)] w-[var(--orb)] [--orb:min(94vw,30rem)] md:[--orb:clamp(20rem,100svh-26rem,35rem)]'
        />

        <p className='lede relative max-w-[36rem] lg:max-w-[42rem]'>{hero.subhead}</p>
        <div className='relative mt-7 flex flex-wrap items-center justify-center gap-3'>
          <SmartLink href={siteConfig.cta.href} className='btn btn-primary h-13 px-7 text-[1.0625rem]'>
            {siteConfig.cta.label}
          </SmartLink>
          <SmartLink href={hero.secondary.href} className='btn btn-quiet h-13 px-6 text-[1.0625rem]'>
            <svg viewBox='0 0 16 16' className='size-3.5' aria-hidden='true'>
              <path d='M4 2.8v10.4L13 8z' fill='currentColor' />
            </svg>
            {hero.secondary.label}
          </SmartLink>
        </div>
        <p className='relative mt-5 text-sm text-ink-soft'>{hero.note}</p>
      </div>
    </section>
  );
}
