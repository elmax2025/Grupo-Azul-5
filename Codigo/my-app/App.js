import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './src/Login/login';
import Registro from './src/Register/Registro';
import Contraseñaperdida from './src/Contraseñaperdida/contraseña';
import Perfil from './src/Perfil/perfil';
import Feed from './src/Feed/Feed';
import UserConfig from './src/Configuracion user/UserConfig';
import ConfigAdmin from './src/Config Admin/ConfigAdmin';
import Accesibilidad from './src/Accesibilidad/Accesibilidad';

// Importar las nuevas pantallas - CORREGIDO: sin espacios extras
import LikedPosts from './src/LikedPosts/LikedPosts';
import SharedPosts from './src/SharedPosts/SharedPosts';
import PrivacySecurity from './src/PrivacySecurity/PrivacySecurity';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        {/* Pantallas existentes */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Registro" component={Registro} />
        <Stack.Screen name="Contraseñaperdida" component={Contraseñaperdida} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen name="Feed" component={Feed} />
        <Stack.Screen name="UserConfig" component={UserConfig} />
        <Stack.Screen name="ConfigAdmin" component={ConfigAdmin} />
        <Stack.Screen name="Accesbilidad" component={Accesibilidad} />
        
        {/* Nuevas pantallas de configuración */}
        <Stack.Screen name="LikedPosts" component={LikedPosts} />
        <Stack.Screen name="SharedPosts" component={SharedPosts} />
        <Stack.Screen name="PrivacySecurity" component={PrivacySecurity} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
