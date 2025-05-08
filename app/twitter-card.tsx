import { Metadata } from 'next';

export const twitterCard: Metadata['twitter'] = {
  card: 'summary_large_image',
  site: '@theactualdev',
  creator: '@theactualdev',
  title: 'Tociano Boutique | Premium Nigerian Fashion',
  description: 'Discover authentic Nigerian fashion at Tociano Boutique. Premium Ankara prints, Aso Oke, and modern African luxury clothing for all occasions.',
  images: 'https://tociano.vercel.app/image.jpg',
};

export default function TwitterCard() {
  return null;
} 