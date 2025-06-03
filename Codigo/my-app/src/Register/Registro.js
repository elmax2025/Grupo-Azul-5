import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, Alert } from 'react-native';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [errores, setErrores] = useState({});

  const validarCampos = () => {
    const nuevosErrores = {};
    
    if (!nombre.trim()) nuevosErrores.nombre = 'El nombre es requerido';
    if (!email.trim()) nuevosErrores.email = 'El email es requerido';
    else if (!/^\S+@\S+\.\S+$/.test(email)) nuevosErrores.email = 'Email inválido';
    if (!usuario.trim()) nuevosErrores.usuario = 'El usuario es requerido';
    if (!contrasena) nuevosErrores.contrasena = 'La contraseña es requerida';
    else if (contrasena.length < 6) nuevosErrores.contrasena = 'Mínimo 6 caracteres';
    if (contrasena !== confirmarContrasena) nuevosErrores.confirmarContrasena = 'Las contraseñas no coinciden';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleRegistro = () => {
    if (validarCampos()) {
      Alert.alert(
        'Registro exitoso',
        `Usuario ${usuario} registrado correctamente`,
        [
          { text: 'OK', onPress: () => {
            // Limpiar el formulario después del registro
            setNombre('');
            setEmail('');
            setUsuario('');
            setContrasena('');
            setConfirmarContrasena('');
          }}
        ]
      );
    }
  };

  const toggleMostrarContrasena = () => {
    setMostrarContrasena(!mostrarContrasena);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Crear Cuenta</Text>
      
      <Text style={styles.label}>Nombre Completo:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su nombre completo"
        onChangeText={setNombre}
        value={nombre}
      />
      {errores.nombre && <Text style={styles.errorText}>{errores.nombre}</Text>}

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su email"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />
      {errores.email && <Text style={styles.errorText}>{errores.email}</Text>}

      <Text style={styles.label}>Usuario:</Text>
      <TextInput
        style={styles.input}
        placeholder="Cree un nombre de usuario"
        autoCapitalize="none"
        onChangeText={setUsuario}
        value={usuario}
      />
      {errores.usuario && <Text style={styles.errorText}>{errores.usuario}</Text>}

      <Text style={styles.label}>Contraseña:</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Cree una contraseña"
          secureTextEntry={!mostrarContrasena}
          onChangeText={setContrasena}
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
      {errores.contrasena && <Text style={styles.errorText}>{errores.contrasena}</Text>}

      <Text style={styles.label}>Confirmar Contraseña:</Text>
      <TextInput
        style={styles.input}
        placeholder="Repita su contraseña"
        secureTextEntry={!mostrarContrasena}
        onChangeText={setConfirmarContrasena}
        value={confirmarContrasena}
      />
      {errores.confirmarContrasena && <Text style={styles.errorText}>{errores.confirmarContrasena}</Text>}

      <View style={styles.buttonContainer}>
        <Button 
          title="Registrarse" 
          onPress={handleRegistro}
          color="#4CAF50"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    color: '#555',
    fontWeight: '500',
  },
  input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    backgroundColor: 'white',
    width: '100%',
    paddingHorizontal: 15,
    marginBottom: 5,
    borderRadius: 8,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 5,
  },
  passwordInput: {
    flex: 1,
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    fontSize: 16,
  },
  showButton: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderLeftWidth: 0,
  },
  showButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  errorText: {
    alignSelf: 'flex-start',
    color: 'red',
    marginBottom: 10,
    fontSize: 12,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
});