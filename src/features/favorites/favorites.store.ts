import { create } from 'zustand';

type FavoritesState = {
  productIds: string[];

  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  productIds: [],

  toggleFavorite: productId => {
    const exists = get().productIds.includes(productId);

    set({
      productIds: exists
        ? get().productIds.filter(id => id !== productId)
        : [...get().productIds, productId],
    });
  },

  isFavorite: productId => get().productIds.includes(productId),
}));