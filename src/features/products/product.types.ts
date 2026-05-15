export type ProductCategory =
  | 'sofas'
  | 'tables'
  | 'chairs'
  | 'bedroom'
  | 'office'
  | 'kitchen';

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  currency: 'EUR';
  description: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  materials: string[];
  colors: string[];
  imageUrl: string;
  model3dUrl: string;
  isFeatured?: boolean;
  isPromotion?: boolean;
};