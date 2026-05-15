import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  ViroARScene,
  ViroARSceneNavigator,
  Viro3DObject,
  ViroAmbientLight,
  ViroTrackingStateConstants,
} from '@reactvision/react-viro';

import { RootStackParamList } from '../navigation/AppNavigator';
import { productController } from '../features/products/product.controller';
import { useProductStore } from '../features/products/product.store';

type Props = NativeStackScreenProps<RootStackParamList, 'ARViewer'>;

function FurnitureARScene() {
  const { selectedProduct } = useProductStore();

  const onInitialized: React.ComponentProps<
    typeof ViroARScene
  >['onTrackingUpdated'] = (state, reason) => {
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      console.log('AR tracking started');
    }

    if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
      console.log('AR tracking unavailable:', reason);
    }
  };

  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
      <ViroAmbientLight color="#ffffff" />

      {selectedProduct && (
        <Viro3DObject
          source={{ uri: 'file:///android_asset/models/Sofa.glb' }}
          position={[0, -1, -2]}
          scale={[0.5, 0.5, 0.5]}
          type="GLB"
          dragType="FixedToWorld"
          onDrag={() => {}}
        />
      )}
    </ViroARScene>
  );
}

export function ARViewerScreen({ route }: Props) {
  const { productId } = route.params;

  useEffect(() => {
    productController.selectProduct(productId);
  }, [productId]);

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus
        initialScene={{
          scene: FurnitureARScene,
        }}
        style={styles.ar}
      />

      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Move o móvel pela sala</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ar: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  overlayText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});