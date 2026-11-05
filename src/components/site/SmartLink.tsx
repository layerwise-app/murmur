import { Link } from '@tanstack/react-router';
import type * as React from 'react';

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
  /** Extra classes while the link's page is open (page links only). */
  activeClassName?: string;
};

/**
 * One link component for every kind of href in the content files: pages
 * (`/voices`), home sections (`/#waitlist`), same-page anchors (`#voices`),
 * and other sites (opened in a new tab).
 */
export function SmartLink({ href, children, activeClassName, ...rest }: Props) {
  if (/^(https?:|mailto:)/.test(href)) {
    const external = href.startsWith('http');
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }
  if (href.startsWith('#')) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  const [path, hash] = href.split('#');
  return (
    <Link
      to={(path || '/') as '/'}
      hash={hash}
      activeOptions={{ exact: true, includeHash: true }}
      activeProps={hash || !activeClassName ? undefined : { className: activeClassName }}
      {...rest}
    >
      {children}
    </Link>
  );
}
