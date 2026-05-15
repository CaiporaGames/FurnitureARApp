import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ARViewerScreen } from '../screens/ARViewerScreen';
//import { CartScreen } from '../screens/CartScreen';

export type RootStackParamList = {
  Home: undefined;
  ProductDetail: {
    productId: string;
  };
  ARViewer: {
    productId: string;
  };
  Cart: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Móveis AR' }}
        />

        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{ title: 'Produto' }}
        />

        <Stack.Screen
          name="ARViewer"
          component={ARViewerScreen}
          options={{ title: 'Ver na Minha Sala' }}
        />

       {/*  <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ title: 'Carrinho' }}
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}