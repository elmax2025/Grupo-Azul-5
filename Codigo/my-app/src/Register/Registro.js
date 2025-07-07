import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
  StatusBar,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

// Firebase
import { auth, db } from '../../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Registro() {
  const navigation = useNavigation();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [mostrarPicker, setMostrarPicker] = useState(false);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fechaNacimiento;
    setMostrarPicker(Platform.OS === 'ios');
    setFechaNacimiento(currentDate);
  };

  const handleRegistro = async () => {
    if (!nombre || !email || !contrasena) {
      Alert.alert('Error', 'Por favor completá todos los campos.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, contrasena);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'usuarios', uid), {
        nombre,
        email,
        fechaNacimiento: fechaNacimiento.toISOString(),
      });

      Alert.alert('Registro exitoso');
      setNombre('');
      setEmail('');
      setContrasena('');
      setFechaNacimiento(new Date());
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#8B0000" barStyle="light-content" />
      <View style={styles.topBar} />

      <Image
        source={require('../../assets/fideos.png')}
        style={styles.fideos}
        resizeMode="contain"
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ width: '100%' }}>
          <Text style={styles.titulo} numberOfLines={1} adjustsFontSizeToFit>
            Crear una cuenta nueva
          </Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.subtitulo, { textDecorationLine: 'underline', color: '#8e0c0c' }]}>
            ¿Ya estás registrado? Iniciá sesión acá.
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>NOMBRE</Text>
        <TextInput
          style={styles.input}
          placeholder="Martín Pérez"
          placeholderTextColor="#fff9ea"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>EMAIL</Text>
        <TextInput
          style={styles.input}
          placeholder="hola@sitioincreible.com.ar"
          placeholderTextColor="#fff9ea"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>CONTRASEÑA</Text>
        <TextInput
          style={styles.input}
          placeholder="******"
          placeholderTextColor="#fff9ea"
          secureTextEntry
          value={contrasena}
          onChangeText={setContrasena}
        />

        <Text style={styles.label}>FECHA DE NACIMIENTO</Text>
        <TouchableOpacity
          style={[styles.input, styles.superpuesto]}
          onPress={() => setMostrarPicker(true)}
        >
          <Text style={styles.dateText}>{fechaNacimiento.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {mostrarPicker && (
          <DateTimePicker
            value={fechaNacimiento}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <TouchableOpacity
          style={[styles.boton, styles.superpuesto]}
          onPress={handleRegistro}
        >
          <Text style={styles.botonTexto}>Registrarse</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff9ea' },
  topBar: {
    backgroundColor: '#8e0c0c',
    height: 80,
    width: '100%',
    borderBottomWidth: 4,
    borderBottomColor: '#000',
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 300,
    position: 'relative',
    zIndex: 1,
  },
  titulo: {
    fontSize: 54,
    fontStyle: 'italic',
    fontWeight: '900',
    color: '#8e0c0c',
    textAlign: 'center',
    marginVertical: 24,
    fontFamily: Platform.select({
      ios: 'Snell Roundhand',
      android: 'cursive',
      default: 'serif',
    }),
    textShadowColor: '#8e0c0c',
    textShadowOffset: { width: 0.7, height: 0.7 },
    textShadowRadius: 0.5,
  },
  subtitulo: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8e0c0c',
    marginBottom: 6,
    marginTop: 12,
    letterSpacing: 1.2,
  },
  input: {
    backgroundColor: '#8e0c0c',
    color: '#fff',
    fontSize: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#fff9ea',
    marginBottom: 8,
  },
  dateText: {
    color: '#fff9ea',
    fontSize: 16,
  },
  boton: {
    marginTop: 16,
    marginBottom: 40,
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
    width: 320,
  },
  botonTexto: {
    color: '#8e0c0c',
    fontSize: 20,
    fontWeight: 'bold',
  },
  fideos: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 250,
    height: 250,
    zIndex: 0,
  },
  superpuesto: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
});
