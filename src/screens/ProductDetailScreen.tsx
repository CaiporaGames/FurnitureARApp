import React, { useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';
import { productController } from '../features/products/product.controller';
import { useProductStore } from '../features/products/product.store';
import { useCartStore } from '../features/cart/cart.store';
import { useFavoritesStore } from '../features/favorites/favorites.store';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ route, navigation }: Props) {
  const { productId } = route.params;

  const { selectedProduct } = useProductStore();
  const addToCart = useCartStore(state => state.addToCart);
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const isFavorite = useFavoritesStore(state => state.isFavorite);

  useEffect(() => {
    productController.selectProduct(productId);
  }, [productId]);

  if (!selectedProduct) {
    return (
      <View style={styles.container}>
        <Text>A carregar produto...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.viewerPlaceholder}>
        <Text>3D Viewer Placeholder</Text>
      </View>

      <Text style={styles.name}>{selectedProduct.name}</Text>
      <Text style={styles.price}>{selectedProduct.price}€</Text>
      <Text style={styles.description}>{selectedProduct.description}</Text>

      <Text style={styles.sectionTitle}>Dimensões</Text>
      <Text>
        {selectedProduct.dimensions.width}cm x{' '}
        {selectedProduct.dimensions.height}cm x{' '}
        {selectedProduct.dimensions.depth}cm
      </Text>

      <Pressable
        style={styles.arButton}
        onPress={() =>
          navigation.navigate('ARViewer', {
            productId: selectedProduct.id,
          })
        }
      >
        <Text style={styles.buttonText}>Ver na Minha Sala</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => addToCart(selectedProduct)}
      >
        <Text>Adicionar ao Carrinho</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => toggleFavorite(selectedProduct.id)}
      >
        <Text>
          {isFavorite(selectedProduct.id)
            ? 'Remover dos Favoritos'
            : 'Guardar Favorito'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  viewerPlaceholder: {
    height: 260,
    borderRadius: 20,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 8,
  },
  description: {
    fontSize: 15,
    color: '#555',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  arButton: {
    marginTop: 24,
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryButton: {
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#eeeeee',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});