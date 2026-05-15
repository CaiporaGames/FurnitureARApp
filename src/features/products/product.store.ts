import { create } from 'zustand';
import { Product } from './product.types';

type ProductState = {
  products: Product[];
  featuredProducts: Product[];
  selectedProduct?: Product;
  isLoading: boolean;
  error?: string;

  setProducts: (products: Product[]) => void;
  setFeaturedProducts: (products: Product[]) => void;
  setSelectedProduct: (product?: Product) => void;
  setLoading: (value: boolean) => void;
  setError: (message?: string) => void;
};

export const useProductStore = create<ProductState>(set => ({
  products: [],
  featuredProducts: [],
  selectedProduct: undefined,
  isLoading: false,
  error: undefined,

  setProducts: products => set({ products }),
  setFeaturedProducts: featuredProducts => set({ featuredProducts }),
  setSelectedProduct: selectedProduct => set({ selectedProduct }),
  setLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),
}));