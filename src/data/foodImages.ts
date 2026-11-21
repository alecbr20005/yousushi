export type FoodImage = {
  src: string;
  title: string;
  alt: string;
  source: string;
  sourceUrl: string;
  licenseUrl: string;
};

const source = 'Unsplash License; illustrative photography, not verified as You Sushi';
const licenseUrl = 'https://unsplash.com/license';

export const foodImages: FoodImage[] = [
  {
    src: '/images/food/sushi-editorial.webp',
    title: 'Sushi variado',
    alt: 'Rollos de sushi variados presentados en una bandeja',
    source,
    sourceUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
    licenseUrl,
  },
  {
    src: '/images/food/sharing-platter.webp',
    title: 'Selección japonesa',
    alt: 'Selección de pescado y acompañamientos en un bol japonés',
    source,
    sourceUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa',
    licenseUrl,
  },
  {
    src: '/images/food/friends-platter.webp',
    title: 'Bandeja para compartir',
    alt: 'Bandeja abundante de sushi variado para compartir',
    source,
    sourceUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754',
    licenseUrl,
  },
  {
    src: '/images/food/ramen-bowl.webp',
    title: 'Ramen',
    alt: 'Bol de ramen japonés con fideos y acompañamientos',
    source,
    sourceUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624',
    licenseUrl,
  },
  {
    src: '/images/food/japanese-specialties.webp',
    title: 'Gyozas',
    alt: 'Gyozas japonesas servidas en un plato',
    source,
    sourceUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c',
    licenseUrl,
  },
];
