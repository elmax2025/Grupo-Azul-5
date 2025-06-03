import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity } from 'react-native';

export default function Login() {
  // Estados
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [mostrarError, setMostrarError] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const manejarPresion = () => {
    if (!usuario.trim() || !contrasena.trim()) {
      setMensajeError('El Usuario o Contraseña son incorrectos');
      setMostrarError(true);
    } else {
      setMensajeError('El Usuario o Contraseña son incorrectos');
      setMostrarError(true);
    }
  };

  const manejarPresion2 = () => {
    // Lógica para crear usuario
  };

  const toggleMostrarContrasena = () => {
    setMostrarContrasena(!mostrarContrasena);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.texto1}>Escribe Usuario:</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Usuario"
        onChangeText={text => setUsuario(text)}
        value={usuario}
      />

      <Text style={styles.texto1}>Escribe Contraseña:</Text>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          secureTextEntry={!mostrarContrasena}
          onChangeText={text => setContrasena(text)}
          value={contrasena}
        />
        <TouchableOpacity 
          style={styles.showButton}
          onPress={toggleMostrarContrasena}
        >
          <Text style={styles.showButtonText}>
            {mostrarContrasena ? 'Ocultar' : 'Mostrar'}
          </Text>
        </TouchableOpacity>
      </View>
     
      {mostrarError && (
        <Text style={styles.errorText}>{mensajeError}</Text>
      )}
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Iniciar Sesión" 
          onPress={manejarPresion}
        />
        
        <View style={styles.buttonSpacer} />
        
        <Button 
          title="Crear Usuario" 
          onPress={manejarPresion2}
        />
      </View>
      
      <StatusBar style="auto"/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  texto1: {
    backgroundColor: '#5555',
    padding: 10,
    marginBottom: 10,
    color: 'black',
    width: '100%',
  },
  input: {
    height: 40,
    borderColor: 'blue',
    borderWidth: 1,
    backgroundColor: 'white',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    height: 40,
    borderColor: 'blue',
    borderWidth: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  showButton: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    borderWidth: 1,
    borderColor: 'blue',
    borderLeftWidth: 0,
  },
  showButtonText: {
    color: 'blue',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
  buttonSpacer: {
    height: 10,
  },
});