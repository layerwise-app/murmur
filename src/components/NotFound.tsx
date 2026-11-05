import { Link } from '@tanstack/react-router';
import { Orb } from '~/components/orb/Orb';
import { siteConfig } from '~/site.config';

/** The 404 page: the orb is quiet here, and doesn't respond to anything. */
export function NotFound() {
  return (
    <section
      aria-labelledby='not-found-heading'
      className='mx-auto flex max-w-3xl flex-col items-center px-5 pb-24 pt-6 text-center sm:pt-10'
    >
      <Orb
        palette='rest'
        quiet
        reactive={false}
        priority
        label='The orb, resting quietly'
        sizes='(min-width: 768px) 420px, 80vw'
        className='-mb-[calc(var(--o)*0.12)] w-[var(--o)] [--o:min(80vw,24rem)] md:[--o:27rem]'
      />
      <p className='eyebrow relative [--voice:var(--sand-deep)]'>Page not found</p>
      <h1 id='not-found-heading' className='display-xl relative mt-5'>
        This page is quiet.
      </h1>
      <p className='lede relative mt-6 max-w-[30rem]'>
        There’s nothing to read aloud at this address. It may have moved, or the link may have a
        typo.
      </p>
      <div className='relative mt-9 flex flex-wrap justify-center gap-3'>
        <Link to='/' className='btn btn-primary h-13 px-7'>
          Back to {siteConfig.product}
        </Link>
        <Link to='/voices' className='btn btn-quiet h-13 px-6'>
          Hear the voices
        </Link>
      </div>
    </section>
  );
}
