import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './src/Login/login';
import Registro from './src/Register/Registro';
import Contraseñaperdida from './src/Contraseñaperdida/contraseña';
import Perfil from './src/Perfil/perfil';
import Feed from './src/Feed/Feed';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Feed" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Registro" component={Registro} />
        <Stack.Screen name="Contraseñaperdida" component={Contraseñaperdida} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen name="Feed" component={Feed} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
