import { Link, useRouter } from '@tanstack/react-router';
import { useEffect, useId, useRef, useState } from 'react';
import { siteConfig } from '~/site.config';
import { Wordmark } from './Logo';
import { SmartLink } from './SmartLink';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Close the menu after any navigation.
  useEffect(() => router.subscribe('onResolved', () => setOpen(false)), [router]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onHash = () => setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', onHash);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('hashchange', onHash);
    };
  }, [open]);

  return (
    <header className='sticky top-0 z-50 border-b border-line/0 bg-cream/85 backdrop-blur-md supports-[backdrop-filter]:bg-cream/72'>
      <div className='mx-auto flex h-16 max-w-[84rem] items-center gap-4 px-5 sm:px-8'>
        <Link
          to='/'
          className='-ml-1 rounded-full p-1'
          aria-label={`${siteConfig.product}, home`}
        >
          <Wordmark />
        </Link>

        <nav aria-label='Main' className='ml-auto hidden md:block'>
          <ul className='flex items-center gap-1'>
            {siteConfig.navigation.map((item) => (
              <li key={item.href}>
                <SmartLink
                  href={item.href}
                  className='inline-flex h-11 items-center rounded-full px-4 text-[0.95rem] font-medium text-ink-soft transition-colors hover:text-ink'
                  activeClassName='!text-ink'
                >
                  {item.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className='ml-auto flex items-center gap-2 md:ml-3'>
          <SmartLink href={siteConfig.cta.href} className='btn btn-primary h-11 min-h-11 px-5 text-[0.95rem]'>
            <span className='hidden sm:inline'>{siteConfig.cta.label}</span>
            <span className='sm:hidden'>{siteConfig.cta.short}</span>
          </SmartLink>
          <button
            ref={buttonRef}
            type='button'
            className='inline-flex size-11 items-center justify-center rounded-full text-ink hairline md:hidden'
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <svg viewBox='0 0 24 24' className='size-5' aria-hidden='true'>
              {open ? (
                <path d='M6 6l12 12M18 6L6 18' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
              ) : (
                <path d='M4 8.5h16M4 15.5h16' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={panelRef}
        id={menuId}
        hidden={!open}
        className='border-t border-line bg-cream px-5 pb-6 pt-2 md:hidden'
      >
        <nav aria-label='Main, compact'>
          <ul className='flex flex-col'>
            {[{ label: 'Home', href: '/' }, ...siteConfig.navigation].map((item) => (
              <li key={item.href} className='border-b border-line last:border-0'>
                <SmartLink
                  href={item.href}
                  className='flex h-14 items-center font-display text-2xl font-[340]'
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
