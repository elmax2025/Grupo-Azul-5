import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function Configuracion({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Configuracion</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.menuDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#8B4513' }]}>
            <Text style={styles.iconText}>👤</Text>
          </View>
          <Text style={styles.menuText}>Tu Cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#8B0000' }]}>
            <Text style={styles.iconText}>❤️</Text>
          </View>
          <Text style={styles.menuText}>Ver Me Gusta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#DAA520' }]}>
            <Text style={styles.iconText}>📎</Text>
          </View>
          <Text style={styles.menuText}>Ver Compartidos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#8B0000' }]}>
            <Text style={styles.iconText}>🔒</Text>
          </View>
          <Text style={styles.menuText}>Privacidad y Seguridad</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('AccesibilidadPantalla')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#DAA520' }]}>
            <Text style={styles.iconText}>↗️</Text>
          </View>
          <Text style={styles.menuText}>Accesibilidad, Pantalla e Idiomas</Text>
        </TouchableOpacity>
      </View>

      {/* Cerrar Sesion Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar Sesion</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backArrow: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  titleContainer: {
    backgroundColor: '#D2B48C',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    marginRight: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B0000',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  menuButton: {
    backgroundColor: '#8B0000',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginHorizontal: 2,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  iconText: {
    fontSize: 24,
  },
  menuText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#DAA520',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});