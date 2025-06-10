import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, Platform, Pressable, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

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
    if (!contrasena) nuevosErrores.contrasena = 'La contraseña es requerida';
    else if (contrasena.length < 6) nuevosErrores.contrasena = 'Mínimo 6 caracteres';

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
    setShowPicker(Platform.OS === 'ios');
  };

  const handleRegistro = () => {
    if (validarCampos()) {
      Alert.alert(
        'Registro exitoso',
        `Usuario ${nombre} registrado correctamente`,
        [
          { text: 'OK', onPress: () => {
            setNombre('');
            setEmail('');
            setContrasena('');
            setSelected(false);
            setDate(new Date());
          }}
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Creá una cuenta Nueva</Text>
      <Text style={styles.subtitulo}>¿Ya estás registrado? Iniciá sesión aquí</Text>
      
      <Text style={styles.label}>Nombre:</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={24} color="#f5e8e1" style={styles.iconInput} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su nombre completo"
          placeholderTextColor="#f5e8e1"
          onChangeText={setNombre}
          value={nombre}
        />
      </View>
      {errores.nombre && <Text style={styles.errorText}>{errores.nombre}</Text>}

      <Text style={styles.label}>Email:</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={24} color="#f5e8e1" style={styles.iconInput} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#f5e8e1"
          onChangeText={setEmail}
          value={email}
        />
      </View>
      {errores.email && <Text style={styles.errorText}>{errores.email}</Text>}

      <Text style={styles.label}>Contraseña:</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} color="#f5e8e1" style={styles.iconInput} />
        <TextInput
          style={styles.input}
          placeholder="Cree una contraseña"
          placeholderTextColor="#f5e8e1"
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
        <Ionicons name="chevron-down-outline" size={20} color="#f5e8e1" />
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
          maximumDate={new Date()}
        />
      )}

      <TouchableOpacity style={styles.botonPersonalizado} onPress={handleRegistro} activeOpacity={0.7}>
        <Text style={styles.textoBoton}>Registrarme</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7931e',
    padding: 30,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
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
    marginBottom: 6,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7b3f2c',
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  iconInput: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    paddingVertical: 14,
    fontSize: 16,
  },
  errorText: {
    color: '#fff',
    backgroundColor: '#c62828',
    padding: 6,
    borderRadius: 6,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 13,
  },
  selectorBox: {
    backgroundColor: '#7b3f2c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 25,
  },
  text: {
    color: '#f5e8e1',
    fontSize: 16,
  },
  botonPersonalizado: {
    backgroundColor: '#5a2d0c',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
});