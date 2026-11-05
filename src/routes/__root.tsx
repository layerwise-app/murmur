/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute
} from '@tanstack/react-router';
import type * as React from 'react';
import figtreeLatin from '@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2?url';
import frauncesLatin from '@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2?url';
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary';
import { NotFound } from '~/components/NotFound';
import { SiteFooter } from '~/components/site/SiteFooter';
import { SiteHeader } from '~/components/site/SiteHeader';
import { site } from '~/lib/site';
import { siteConfig } from '~/site.config';
import { seo } from '~/utils/seo';
import '~/styles/app.css';

const { colors, fonts } = siteConfig;
const themeCss = `:root{--cream:${colors.cream};--sand:${colors.sand};--sand-deep:${colors.sandDeep};--ink:${colors.ink};--ink-soft:${colors.inkSoft};--line:${colors.line};--apricot:${colors.apricot};--rose:${colors.rose};--sage:${colors.sage};--error:${colors.error};--font-display-stack:${fonts.display};--font-body-stack:${fonts.body}}`;

export const Route = createRootRoute({
  // Site-wide defaults; each page's `seo()` overrides tags with the same name.
  head: ({ matches }) => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: colors.cream },
      ...(site.googleSiteVerification
        ? [
            {
              name: 'google-site-verification',
              content: site.googleSiteVerification
            }
          ]
        : []),
      ...seo({ title: site.name, description: site.description }).meta,
      // Unknown addresses: a quiet page that stays out of search results.
      ...(isNotFound(matches)
        ? seo({
            title: `Page not found — ${site.name}`,
            description: 'This page is quiet. The address may have changed.',
            image: '/og/not-found.png',
            noindex: true
          }).meta
        : [])
    ],
    links: [
      {
        rel: 'preload',
        href: frauncesLatin,
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous'
      },
      {
        rel: 'preload',
        href: figtreeLatin,
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous'
      },
      { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
      { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/site.webmanifest' }
    ]
  }),
  errorComponent: (props) => (
    <RootDocument>
      <DefaultCatchBoundary {...props} />
    </RootDocument>
  ),
  notFoundComponent: () => <NotFound />,
  component: RootComponent
});

function isNotFound(matches: object[]) {
  // The router marks the match that renders the not-found page.
  return matches.some(
    (match) =>
      (match as { _notFound?: boolean })._notFound === true ||
      (match as { status?: string }).status === 'notFound'
  );
}

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        <HeadContent />
      </head>
      <body>
        <a
          href='#main'
          className='sr-only-focusable fixed left-4 top-3 z-[60] rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream'
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id='main' tabIndex={-1} className='outline-none'>
          {children}
        </main>
        <SiteFooter />
        <Scripts />
      </body>
    </html>
  );
}
