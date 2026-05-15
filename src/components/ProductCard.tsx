import React from 'react';
import {
  Text,
  View,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Product } from '../features/products/product.types';

type Props = {
  product: Product;
  onPress: () => void;
};

export function ProductCard({ product, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imagePlaceholder}>
        <Text>Imagem</Text>
      </View>

      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{product.price}€</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  imagePlaceholder: {
    height: 120,
    borderRadius: 12,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
});