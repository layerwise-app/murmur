import { useId } from 'react';
import { siteConfig } from '~/site.config';

/**
 * The Murmur mark: the warm orb glowing on an ink tile, with a soft "m" of two
 * arches. The same drawing as public/logo.svg (keep them in step).
 */
export function LogoMark({ className = 'size-8' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox='0 0 64 64' className={className} aria-hidden='true' focusable='false'>
      <defs>
        <radialGradient id={`${id}-glow`} cx='0.5' cy='0.5' r='0.5'>
          <stop offset='0.8' stopColor='#f0a46c' stopOpacity='0.42' />
          <stop offset='1' stopColor='#f0a46c' stopOpacity='0' />
        </radialGradient>
        <radialGradient id={`${id}-orb`} cx='0.4' cy='0.32' r='0.74'>
          <stop offset='0' stopColor='#ffe9d3' />
          <stop offset='0.42' stopColor='#f4a66f' />
          <stop offset='0.82' stopColor='#d8857a' />
          <stop offset='1' stopColor='#b9695f' />
        </radialGradient>
        <radialGradient id={`${id}-sage`} cx='0.22' cy='0.86' r='0.4'>
          <stop offset='0' stopColor='#9fb28f' stopOpacity='0.45' />
          <stop offset='1' stopColor='#9fb28f' stopOpacity='0' />
        </radialGradient>
      </defs>
      <rect width='64' height='64' rx='15' fill='#2a201b' />
      <circle cx='32' cy='32' r='28.5' fill={`url(#${id}-glow)`} />
      <circle cx='32' cy='32' r='22.5' fill={`url(#${id}-orb)`} />
      <circle cx='32' cy='32' r='22.5' fill={`url(#${id}-sage)`} />
      <path
        d='M21.6 41V32.2c0-4.1 2.4-6.7 5.2-6.7s5.2 2.6 5.2 6.7V41M32 32.2c0-4.1 2.4-6.7 5.2-6.7s5.2 2.6 5.2 6.7V41'
        fill='none'
        stroke='#2a201b'
        strokeWidth='4.4'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className='size-8' />
      <span className='font-display text-[1.6rem] font-[380] leading-none tracking-[-0.02em]'>
        {siteConfig.product}
      </span>
    </span>
  );
}
