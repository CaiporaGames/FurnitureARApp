import { productService } from './product.service';
import { ProductCategory } from './product.types';
import { useProductStore } from './product.store';

export const productController = {
  async loadHomeProducts() {
    const store = useProductStore.getState();

    try {
      store.setLoading(true);
      store.setError(undefined);

      const [products, featuredProducts] = await Promise.all([
        productService.getProducts(),
        productService.getFeaturedProducts(),
      ]);

      store.setProducts(products);
      store.setFeaturedProducts(featuredProducts);
    } catch {
      store.setError('Não foi possível carregar os produtos.');
    } finally {
      store.setLoading(false);
    }
  },

  async loadProductsByCategory(category: ProductCategory) {
    const store = useProductStore.getState();

    try {
      store.setLoading(true);
      store.setError(undefined);

      const products = await productService.getProductsByCategory(category);
      store.setProducts(products);
    } catch {
      store.setError('Não foi possível carregar esta categoria.');
    } finally {
      store.setLoading(false);
    }
  },

  async selectProduct(productId: string) {
    const store = useProductStore.getState();

    try {
      store.setLoading(true);
      store.setError(undefined);

      const product = await productService.getProductById(productId);
      store.setSelectedProduct(product);
    } catch {
      store.setError('Produto não encontrado.');
    } finally {
      store.setLoading(false);
    }
  },
};