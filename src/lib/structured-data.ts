import { siteUrl } from '~/lib/site';
import { siteConfig } from '~/site.config';

/** schema.org data for the company and the app, used on the home page. */
export function organizationJsonLd() {
  const sameAs = siteConfig.social.map((item) => item.href).filter(Boolean);
  const email = siteConfig.contactEmail.trim();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': siteUrl('/#organization'),
    name: siteConfig.company,
    legalName: siteConfig.companyLegalName,
    url: siteUrl('/'),
    logo: siteUrl('/logo.png'),
    ...(email ? { email } : {}),
    numberOfEmployees: { '@type': 'QuantitativeValue', value: 12 },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bristol',
      addressCountry: 'GB'
    },
    ...(sameAs.length ? { sameAs } : {})
  };
}

export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.product,
    description: siteConfig.description,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'iOS, Android, Web',
    url: siteUrl('/'),
    image: siteUrl('/og/home.png'),
    publisher: { '@id': siteUrl('/#organization') },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/PreOrder',
      description: 'Join the waitlist; the free plan opens in early 2027.'
    }
  };
}
