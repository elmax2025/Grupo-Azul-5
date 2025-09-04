import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function AccesibilidadPantalla({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
  <TouchableOpacity 
    style={styles.backButton}
    onPress={() => navigation.goBack()}
  >
    <Text style={styles.backArrow}>&lt;</Text>
  </TouchableOpacity>
  <View style={styles.titleContainer}>
    <Text style={styles.title}>Accesibilidad, Pantalla e Idiomas</Text>
  </View>
</View>

      {/* Subsection Menu */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.subIconContainer, { backgroundColor: '#8B0000' }]}>
            <Text style={styles.subIconText}>🌐</Text>
          </View>
          <Text style={styles.menuText}> 🌐 Idiomas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.subIconContainer, { backgroundColor: 'transparent' }]}>
            <Text style={styles.subIconText}>👁️</Text>
          </View>
          <Text style={styles.menuText}>Accesibilidad</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.subIconContainer, { backgroundColor: 'transparent' }]}>
            <Text style={styles.subIconText}>✏️</Text>
          </View>
          <Text style={styles.menuText}>Pantalla</Text>
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
    width: 50,
    height: 50,
    borderRadius: 20,
    backgroundColor: '#D2B48C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backArrow: {
    fontSize: 30,
    color: '#8B0000',
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
    fontSize: 17,
    fontWeight: '600',
    color: '#8B0000',
    textAlign: 'center',
    fontStyle: 'cursive',
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
  selectedSection: {
    backgroundColor: '#8B0000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
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
  selectedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
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
  subIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  subIconText: {
    fontSize: 24,
  },
  menuText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
