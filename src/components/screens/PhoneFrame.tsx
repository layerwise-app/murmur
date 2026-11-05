import type * as React from 'react';

/** An iPhone-shaped frame drawn in CSS. The screen is whatever you put inside. */
export function PhoneFrame({
  children,
  className = '',
  label
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={`relative aspect-[393/852] w-full rounded-[3.1rem] bg-[#231a16] p-[0.6rem] shadow-[0_40px_80px_-40px_rgba(42,32,27,0.55),0_0_0_1px_rgba(255,255,255,0.06)_inset] ${className}`}
      role={label ? 'group' : undefined}
      aria-label={label}
    >
      <div className='relative size-full overflow-hidden rounded-[2.55rem] bg-cream'>
        <div
          aria-hidden='true'
          className='absolute left-1/2 top-[0.55rem] z-20 h-[1.65rem] w-[30%] -translate-x-1/2 rounded-full bg-[#120d0b]'
        />
        {children}
      </div>
    </div>
  );
}

export function StatusBar({ tone = 'ink' }: { tone?: 'ink' | 'cream' }) {
  const color = tone === 'ink' ? 'text-ink' : 'text-cream';
  return (
    <div
      aria-hidden='true'
      className={`flex h-11 shrink-0 items-center justify-between px-7 pt-1 text-[0.8rem] font-semibold ${color}`}
    >
      <span className='tabular-nums'>9:41</span>
      <span className='flex items-center gap-1.5'>
        <svg viewBox='0 0 18 12' className='h-2.5 w-4'>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 4.6} y={9 - i * 3} width='3' height={3 + i * 3} rx='0.8' fill='currentColor' />
          ))}
        </svg>
        <svg viewBox='0 0 16 12' className='h-2.5 w-3.5'>
          <path d='M8 11.2 5.6 8.6a3.4 3.4 0 0 1 4.8 0zM3.4 6.4a6.5 6.5 0 0 1 9.2 0l-1.2 1.3a4.8 4.8 0 0 0-6.8 0zM1.2 4.1a9.6 9.6 0 0 1 13.6 0l-1.2 1.2a7.9 7.9 0 0 0-11.2 0z' fill='currentColor' />
        </svg>
        <svg viewBox='0 0 26 12' className='h-2.5 w-5.5'>
          <rect x='0.5' y='0.5' width='22' height='11' rx='3' fill='none' stroke='currentColor' opacity='0.45' />
          <rect x='2' y='2' width='16' height='8' rx='1.8' fill='currentColor' />
          <rect x='23.6' y='4' width='1.6' height='4' rx='0.8' fill='currentColor' opacity='0.45' />
        </svg>
      </span>
    </div>
  );
}
