import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';

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
    
        <View style={styles.container}>
          <Text style={styles.texto1}>¿Olvidaste la contraseña?:</Text>
          <Text style={styles.texto1}>Nueva contraseña:</Text>
          <Text style={styles.texto1}>EMAIL:</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={text => setEmail(text)}
            value={email}
          />

        {mostrarError && (
                <Text style={styles.errorText}>{mensajeError}</Text>
              )}
         
          <View style={styles.buttonContainer}>
            <Button 
              title="Ingresar" 
              onPress={manejarPresion}
            />
          </View>
          
          <StatusBar style="auto"/>
        </View>
      );
    }

const styles = StyleSheet.create({
  container: {
    flex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  texto2: {
    padding: 10,
    marginBottom: 10,
    color: 'black',
    width: '100%',
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