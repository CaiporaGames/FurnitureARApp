import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';
import { ProductCard } from '../components/ProductCard';
import { productController } from '../features/products/product.controller';
import { useProductStore } from '../features/products/product.store';
import { NativeModules } from 'react-native';
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
useEffect(() => {
    console.log('Native Viro check:', {
      VRTMaterialManager: NativeModules.VRTMaterialManager,
      VRTAnimationManager: NativeModules.VRTAnimationManager,
      VRTARSceneNavigatorModule: NativeModules.VRTARSceneNavigatorModule,
      ViroModule: NativeModules.ViroModule,
    });
}, []);
export function HomeScreen({ navigation }: Props) {
  const { featuredProducts, isLoading, error } = useProductStore();

  useEffect(() => {
    productController.loadHomeProducts();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Encontra móveis para a tua casa</Text>
      <Text style={styles.subtitle}>Experimenta em AR antes de comprar.</Text>

      {isLoading && <Text>A carregar produtos...</Text>}
      {error && <Text>{error}</Text>}

      <FlatList
        data={featuredProducts}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() =>
              navigation.navigate('ProductDetail', {
                productId: item.id,
              })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f6f6f6',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 20,
    color: '#666',
  },
  row: {
    justifyContent: 'space-between',
  },
});