import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConfiguracionAdmin = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backArrow}>{'<'}</Text>
        <Text style={styles.headerTitle}>Configuracion</Text>
      </View>

      <TouchableOpacity style={styles.darkButton}>
        <Ionicons name="person-circle-outline" size={32} color="white" />
        <Text style={styles.buttonText}>Tu Cuenta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.darkButton}>
        <Ionicons name="person-circle-outline" size={32} color="white" />
        <Text style={styles.buttonText}>Informacion de la Cuenta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.darkButton}>
        <Ionicons name="lock-closed" size={28} color="white" />
        <Text style={styles.buttonText}>Cambia Tu Contraseña</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.darkButton}>
        <Ionicons name="close-circle-outline" size={32} color="white" />
        <Text style={styles.buttonText}>Desactivar Cuenta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.darkButton}>
        <Ionicons name="star" size={28} color="white" />
        <Text style={styles.buttonText}>Panel de Admin</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.lightButton}>
        <Ionicons name="star" size={28} color="white" />
        <Text style={styles.buttonText}>Ver Usuarios Registrados</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.lightButton}>
        <Ionicons name="star" size={28} color="white" />
        <Text style={styles.buttonText}>Suspender Cuentas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.lightButton}>
        <Ionicons name="star" size={28} color="white" />
        <Text style={[styles.buttonText, styles.multilineText]}>
          Eliminar Publicaciones{'\n'}Inapropiadas
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8D7B8',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8D7B8',
    borderRadius: 25,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#D4C5A9',
  },
  backArrow: {
    fontSize: 24,
    color: '#8B2020',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B2020',
  },
  darkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B1A1A',
    borderRadius: 30,
    padding: 20,
    marginBottom: 15,
  },
  lightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E89B8E',
    borderRadius: 30,
    padding: 20,
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  multilineText: {
    lineHeight: 22,
  },
});

export default ConfiguracionAdmin;