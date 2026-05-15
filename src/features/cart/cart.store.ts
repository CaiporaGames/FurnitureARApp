import { create } from 'zustand';
import { Product } from '../products/product.types';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];

  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;

  total: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addToCart: product => {
    const existingItem = get().items.find(item => item.product.id === product.id);

    if (existingItem) {
      set({
        items: get().items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      });
      return;
    }

    set({
      items: [...get().items, { product, quantity: 1 }],
    });
  },

  removeFromCart: productId => {
    set({
      items: get().items.filter(item => item.product.id !== productId),
    });
  },

  increaseQuantity: productId => {
    set({
      items: get().items.map(item =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    });
  },

  decreaseQuantity: productId => {
    set({
      items: get()
        .items.map(item =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item,
        ),
    });
  },

  clearCart: () => set({ items: [] }),

  total: () =>
    get().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    ),
}));