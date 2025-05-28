import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';

export default function App() {
  //BACK
  const [nombre, setNombre] = useState('');
  const [mostrarNombre, setMostrarNombre] = useState('');
  const [contrasena, setcontrasena] = useState ('');

  const manejarPresion = () => {
    {contrasena ? (
        <Text style={styles.resultado}>PASO LA PRUEBA!</Text>
      ) : <Text style={styles.resultado}>no hay nada </Text>}
  };

  return (
    <View style={styles.container}>
      <Text style={styles.texto1}>Escribe tu nombre:</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Tu nombre"
        onChangeText={text => setNombre(text)}
        value={nombre}
      />

      <Text style={styles.texto1}>Escribe tu Contraseña:</Text>

      <TextInput
        style={styles.input}
        placeholder="Tu contraseña"
        onChangeText={text => setcontrasena(text)}
        value={contrasena}
      />

      <Button title="Iniciar Sesion" onPress={manejarPresion()} />
      
      <StatusBar style="auto" />
    </View>
  );
}

//FRONT
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9958',
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
