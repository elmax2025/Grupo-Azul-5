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

// Importar las nuevas pantallas
import LikedPosts from './src/LikedPosts/LikedPosts';
import SharedPosts from './src/SharedPosts/SharedPosts';
import PrivacySecurity from './src/PrivacySecurity/PrivacySecurity';

// Pantallas de búsqueda de usuarios
import SearchUsersScreen from './src/SearchUsers/SearchUsersScreen';
import UserProfileScreen from './src/UserProfile/UserProfileScreen';

// --- IMPORTAR EL PROVIDER DE ACCESIBILIDAD ---
import { AccessibilityProvider } from './src/context/AccesibilityContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AccessibilityProvider>
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
          
          {/* Pantallas de búsqueda */}
          <Stack.Screen 
            name="SearchUsers" 
            component={SearchUsersScreen}
            options={{ 
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right'
            }} 
          />
          <Stack.Screen 
            name="UserProfile" 
            component={UserProfileScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AccessibilityProvider>
  );
}
