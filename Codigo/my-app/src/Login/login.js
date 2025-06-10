import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [mostrarError, setMostrarError] = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timeout;
    if (mostrarError) {
      timeout = setTimeout(() => setMostrarError(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [mostrarError]);

  const manejarPresion = () => {
    if (!usuario.trim() || !contrasena.trim()) {
      setMensajeError('El Usuario o Contraseña son incorrectos');
      setMostrarError(true);
      return;
    }
    setMostrarError(false);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Login exitoso (simulado)');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <Text style={styles.navbarTitle}>Login</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.texto2}>ACCEDÉ:</Text>

        <View style={styles.barritaDecorativa} />

        <Text style={styles.subtitulo}>Iniciá sesión para continuar</Text>

        <Text style={styles.texto1}>EMAIL:</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={24} color="#f5e8e1" style={styles.iconInput} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={text => setUsuario(text)}
            value={usuario}
            placeholderTextColor="#f5e8e1"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.texto1}>CONTRASEÑA:</Text>
        <View style={styles.passwordContainer}>
          <Ionicons name="lock-closed-outline" size={24} color="#f5e8e1" style={styles.iconInput} />
          <TextInput
            style={[styles.passwordInput, { paddingRight: 40 }]}
            placeholder="Contraseña"
            secureTextEntry={!mostrarPass}
            onChangeText={text => setContrasena(text)}
            value={contrasena}
            placeholderTextColor="#f5e8e1"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setMostrarPass(!mostrarPass)}>
            <Ionicons name={mostrarPass ? 'eye' : 'eye-off'} size={24} color="#f5e8e1" />
          </TouchableOpacity>
        </View>

        {mostrarError && (
          <View style={styles.errorTextContainer}>
            <Text style={styles.errorText}>{mensajeError}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <TouchableOpacity style={styles.botonPersonalizado} onPress={manejarPresion} activeOpacity={0.7}>
              <Text style={styles.textoBoton}>Ingresar</Text>
            </TouchableOpacity>
          )}
        </View>

        <StatusBar style="light" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7931e',
  },
  navbar: {
    backgroundColor: '#7b3f2c',
    paddingVertical: 16,
    alignItems: 'center',
  },
  navbarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#f7931e',
    padding: 30,
    justifyContent: 'center',
  },
  texto2: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,  // espacio reducido para acercar a la barra
  },
  barritaDecorativa: {
    height: 4,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignSelf: 'center',
    marginVertical: 12, // menos espacio para acercar a texto arriba y subtitulo abajo
    borderRadius: 10,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 5,
  },
  subtitulo: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  texto1: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7b3f2c',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  iconInput: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7b3f2c',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
  },
  errorTextContainer: {
    backgroundColor: '#c62828',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 10,
  },
  botonPersonalizado: {
    backgroundColor: '#5a2d0c',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});