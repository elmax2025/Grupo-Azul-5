import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, Platform, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errores, setErrores] = useState({});
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selected, setSelected] = useState(false);

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

  const togglePicker = () => {
      setShowPicker(true);
    };
  
  const onChange = (event, selectedDate) => {
    if (event.type === 'set') {
      const currentDate = selectedDate || date;
      setDate(currentDate);
      setSelected(true);
    }
    setShowPicker(Platform.OS === 'ios'); // Si es Android, lo cerramos
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
            setContrasena('');
          }}
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Creá una cuenta Nueva</Text>
      <Text style={styles.titulo}>¿Ya estás registrado? Iniciá sesión aquí</Text>
      
      <Text style={styles.label}>Nombre:</Text>
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

      <Text style={styles.label}>Contraseña:</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Cree una contraseña"
          secureTextEntry
          onChangeText={setContrasena}
          value={contrasena}
        />
      </View>
      {errores.contrasena && <Text style={styles.errorText}>{errores.contrasena}</Text>}

      <Text style={styles.label}>Fecha de nacimiento:</Text>
     <Pressable style={styles.selectorBox} onPress={togglePicker}>
        <Text style={styles.text}>
          {selected ? date.toLocaleDateString() : 'Seleccionar'}
        </Text>
        <Ionicons name="chevron-down-outline" size={20} color="#555" />
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}


      <View style={styles.buttonContainer}>
        <Button 
          title="Ingresar" 
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
  selectorBox: {
    width: 250,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'space-between',
    elevation: 3, // sombra en Android
    shadowColor: '#000', // sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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