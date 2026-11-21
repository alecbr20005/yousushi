export type FoodImage = {
  src: string;
  title: string;
  alt: string;
  width: number;
  height: number;
  source: string;
  sourceUrl: string;
  licenseUrl: string;
};

const source = 'Unsplash License; illustrative photography';
const licenseUrl = 'https://unsplash.com/license';

export const foodImages: FoodImage[] = [
  {
    src: '/images/food/sushi-editorial.webp',
    title: 'Sushi variado',
    alt: 'Rollos de sushi variados presentados en una bandeja',
    width: 1440,
    height: 960,
    source,
    sourceUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
    licenseUrl,
  },
  {
    src: '/images/food/sharing-platter.webp',
    title: 'Selección japonesa',
    alt: 'Selección de pescado y acompañamientos en un bol japonés',
    width: 1440,
    height: 962,
    source,
    sourceUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa',
    licenseUrl,
  },
  {
    src: '/images/food/friends-platter.webp',
    title: 'Bandeja para compartir',
    alt: 'Bandeja abundante de sushi variado para compartir',
    width: 1440,
    height: 1152,
    source,
    sourceUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754',
    licenseUrl,
  },
  {
    src: '/images/food/ramen-bowl.webp',
    title: 'Ramen',
    alt: 'Bol de ramen japonés con fideos y acompañamientos',
    width: 1440,
    height: 1440,
    source,
    sourceUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624',
    licenseUrl,
  },
  {
    src: '/images/food/japanese-specialties.webp',
    title: 'Gyozas',
    alt: 'Gyozas japonesas servidas en un plato',
    width: 1440,
    height: 960,
    source,
    sourceUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c',
    licenseUrl,
  },
];
