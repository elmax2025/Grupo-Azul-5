import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './src/Login/login';
import Registro from './src/Register/Registro';
import Contraseñaperdida from './src/Contraseñaperdida/contraseña';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Registro" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Registro" component={Registro} />
        <Stack.Screen name="Contraseñaperdida" component={Contraseñaperdida} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
