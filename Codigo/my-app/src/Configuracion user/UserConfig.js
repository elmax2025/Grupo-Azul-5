import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const Configuracion = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuracion</Text>
      </View>

      <TouchableOpacity style={styles.darkButton}>
        <Ionicons name="person-circle-outline" size={32} color="white" />
        <Text style={styles.buttonText}>Tu Cuenta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.darkButton}>
        <Ionicons name="heart" size={28} color="white" />
        <Text style={styles.buttonText}>Ver Me Gusta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.darkButton}>
        <MaterialCommunityIcons name="paperclip" size={32} color="#D4AF37" />
        <Text style={styles.buttonText}>Ver Compartidos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.darkButton}>
        <Ionicons name="lock-closed" size={28} color="white" />
        <Text style={styles.buttonText}>Privacidad y Seguridad</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.darkButton}>
        <Ionicons name="arrow-forward-circle-outline" size={32} color="white" />
        <Text style={[styles.buttonText, styles.multilineText]}>
          Accesibilidad, Pantalla e{'\n'}Idiomas
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Cerrar Sesion</Text>
      </TouchableOpacity>
    </View>
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
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  multilineText: {
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: '#E8C478',
    borderRadius: 25,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Configuracion;
