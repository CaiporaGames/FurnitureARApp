import { mockProducts } from './product.mock';
import { Product, ProductCategory } from './product.types';

export const productService = {
  async getProducts(): Promise<Product[]> {
    return mockProducts;
  },

  async getFeaturedProducts(): Promise<Product[]> {
    return mockProducts.filter(product => product.isFeatured);
  },

  async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
    return mockProducts.filter(product => product.category === category);
  },

  async getProductById(id: string): Promise<Product | undefined> {
    return mockProducts.find(product => product.id === id);
  },

  async searchProducts(query: string): Promise<Product[]> {
    const normalizedQuery = query.toLowerCase();

    return mockProducts.filter(product =>
      product.name.toLowerCase().includes(normalizedQuery),
    );
  },
};