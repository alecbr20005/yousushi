import { foodImages } from './foodImages';
import type { FoodImage } from './foodImages';

export type Product = {
  id: number;
  name: string;
  description: string;
  image: FoodImage;
};

export const products: Product[] = [
  {
    id: 1,
    name: 'Sushi mixto',
    description: 'Una selección de sushi para disfrutar en cualquier ocasión.',
    image: foodImages[0],
  },
  {
    id: 2,
    name: 'Menú Trío',
    description: 'Una propuesta pensada para compartir.',
    image: foodImages[1],
  },
  {
    id: 3,
    name: 'Menú Friends',
    description: 'Una mesa de sushi para disfrutar en grupo.',
    image: foodImages[2],
  },
  {
    id: 4,
    name: 'Ramen',
    description: 'Un clásico de la cocina japonesa.',
    image: foodImages[3],
  },
  {
    id: 5,
    name: 'Gyozas',
    description: 'Un bocado japonés para compartir.',
    image: foodImages[4],
  },
];
