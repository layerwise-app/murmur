import { createFileRoute } from '@tanstack/react-router';
import { LegalPage } from '~/components/site/LegalPage';
import { termsPage } from '~/content/pages';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/terms')({
  head: () =>
    seo({
      title: termsPage.seo.title,
      description: termsPage.seo.description,
      path: '/terms',
      image: '/og/terms.png',
      imageAlt: termsPage.heading
    }),
  component: () => <LegalPage content={termsPage} />
});
