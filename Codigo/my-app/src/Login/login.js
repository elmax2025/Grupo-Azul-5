import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';

export default function Login() {
  //BACK
  const [usuario, setusuario] = useState('');
  const [mensajeDeError, setmensajeDeError] = useState('');
  const [contrasena, setcontrasena] = useState ('');

  const manejarPresion = () => {
    setmensajeDeError("El usuario o contraseña son incorrectas")
  };

  const manejarPresion2 = () => {

  };

  return (
    <View style={styles.container}>
      <Text style={styles.texto1}>Escribe Usuario:</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Usuario"
        onChangeText={text => setusuario(text)}
        value={usuario}
      />

      <Text style={styles.texto1}>Escribe  Contraseña:</Text>

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        onChangeText={text => setcontrasena(text)}
        value={contrasena}
      />
     
      <View>
        <Button title="Iniciar Sesion" onPress={manejarPresion()} />
        {manejarPresion && (<Text>{mensajeDeError}</Text>)}

        <Button title="Crear Usuario" onPress={manejarPresion2()} />
      </View>
      
      <StatusBar style="auto"/>
    </View>
  );
}

//FRONT
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
    color: 'black'
  },
  input: {
    height: 40,
    borderColor: 'blue',
    borderWidth: 1,
    backgroundColor: 'white',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  resultado: {
    marginTop: 20,
    fontSize: 18,
    color: 'white',
  },
});