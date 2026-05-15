import { Product } from './product.types';

export const mockProducts: Product[] = [
  {
    id: 'sofa-001',
    name: 'Sofá Lisboa 3 Lugares',
    category: 'sofas',
    price: 699,
    currency: 'EUR',
    description: 'Sofá moderno para sala de estar, ideal para apartamentos e casas familiares.',
    dimensions: {
      width: 220,
      height: 85,
      depth: 95,
    },
    materials: ['Tecido', 'Madeira', 'Espuma alta densidade'],
    colors: ['Cinza', 'Bege', 'Azul'],
    imageUrl: 'https://example.com/sofa.png',
    model3dUrl: 'sofa.glb',
    isFeatured: true,
    isPromotion: true,
  },
  {
    id: 'chair-001',
    name: 'Cadeira Porto',
    category: 'chairs',
    price: 89,
    currency: 'EUR',
    description: 'Cadeira simples e elegante para sala de jantar ou escritório.',
    dimensions: {
      width: 45,
      height: 90,
      depth: 50,
    },
    materials: ['Madeira', 'Tecido'],
    colors: ['Preto', 'Branco', 'Castanho'],
    imageUrl: 'https://example.com/chair.png',
    model3dUrl: 'chair.glb',
    isFeatured: true,
  },
];