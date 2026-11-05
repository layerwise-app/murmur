import { createFileRoute } from '@tanstack/react-router';
import { Hero } from '~/components/home/Hero';
import { ListenAnywhere } from '~/components/home/ListenAnywhere';
import { Questions } from '~/components/home/Questions';
import { SaveAnywhere } from '~/components/home/SaveAnywhere';
import { TalkToOrb } from '~/components/home/TalkToOrb';
import { VoicePicker } from '~/components/home/VoicePicker';
import { Waitlist } from '~/components/home/Waitlist';
import { home } from '~/content/home';
import { organizationJsonLd, softwareApplicationJsonLd } from '~/lib/structured-data';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/')({
  head: () =>
    seo({
      title: home.seo.title,
      description: home.seo.description,
      path: '/',
      image: '/og/home.png',
      imageAlt: home.hero.headline,
      jsonLd: [organizationJsonLd(), softwareApplicationJsonLd()]
    }),
  component: Home
});

function Home() {
  return (
    <>
      <Hero />
      <VoicePicker />
      <ListenAnywhere />
      <SaveAnywhere />
      <TalkToOrb />
      <Questions />
      <Waitlist />
    </>
  );
}
