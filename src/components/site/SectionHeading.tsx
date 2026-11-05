import type * as React from 'react';

/** Eyebrow, heading, and an optional paragraph, split across two columns on wide screens. */
export function SectionHeading({
  id,
  eyebrow,
  heading,
  children,
  className = ''
}: {
  id: string;
  eyebrow: string;
  heading: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-end md:gap-16 ${className}`}
    >
      <div>
        <p className='eyebrow'>{eyebrow}</p>
        <h2 id={id} className='display-lg mt-5 max-w-[16ch]'>
          {heading}
        </h2>
      </div>
      {children ? <div className='lede max-w-[34rem] md:pb-2'>{children}</div> : null}
    </div>
  );
}
