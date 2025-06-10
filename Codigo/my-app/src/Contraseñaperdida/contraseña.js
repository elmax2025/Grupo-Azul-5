import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Contraseñaperdida() {
  const [email, setEmail] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [mostrarError, setMostrarError] = useState(false);

  const manejarPresion = () => {
    if (!email.trim()) {
      setMensajeError('El Email es incorrecto');
      setMostrarError(true);
    } else {
      setMensajeError('El Email es incorrecto');
      setMostrarError(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <Text style={styles.navbarTitle}>Recuperar Contraseña</Text>
      </View>

      <View style={styles.innerContainer}>
        <Text style={styles.titulo}>¿Olvidaste la contraseña?</Text>
        <View style={styles.separator} />
        <Text style={styles.subtitulo}>Ingresá tu email para recibir una nueva contraseña</Text>

        <Text style={styles.label}>EMAIL:</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={24} color="#f5e8e1" style={styles.iconInput} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#f5e8e1"
            onChangeText={text => setEmail(text)}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {mostrarError && (
          <Text style={styles.errorText}>{mensajeError}</Text>
        )}

        <TouchableOpacity style={styles.botonPersonalizado} onPress={manejarPresion} activeOpacity={0.7}>
          <Text style={styles.textoBoton}>Enviar</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7931e',
  },
  navbar: {
    backgroundColor: '#7b3f2c',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  navbarTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  innerContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  separator: {
    height: 3,
    backgroundColor: '#fff',
    width: 70,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 6,
  },
  subtitulo: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7b3f2c',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 15,
  },
  iconInput: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#f5e8e1',
    fontSize: 16,
    paddingVertical: 14,
  },
  errorText: {
    color: '#fff',
    backgroundColor: '#c62828',
    padding: 12,
    borderRadius: 10,
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
  },
  botonPersonalizado: {
    backgroundColor: '#5a2d0c',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
});