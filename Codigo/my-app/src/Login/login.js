import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Login({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');

  const handleLogin = () => {
    Alert.alert('Datos ingresados', `Nombre: ${nombre}\nContraseña: ${contrasena}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar} />

      <View style={styles.middleSection}>
        <Text style={styles.ingresar}>Ingresar</Text>
        <Text style={styles.subtitulo}>Iniciá sesión para continuar</Text>

        <View style={styles.form}>
          <Text style={styles.label}>NOMBRE</Text>
          <TextInput
            style={styles.input}
            placeholder="Martín Pérez"
            placeholderTextColor="#fff9ea"
            value={nombre}
            onChangeText={setNombre}
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

          {/* Ir a recuperar contraseña */}
          <TouchableOpacity onPress={() => navigation.navigate('Contraseñaperdida')}>
            <Text style={styles.olvidasteTexto}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.boton} onPress={handleLogin}>
            <Text style={styles.botonTexto}>
              <Text style={{ color: '#8e0c0c' }}>A</Text>
              <Text style={{ color: '#000' }}>c</Text>
              <Text style={{ color: '#8e0c0c' }}>c</Text>
              <Text style={{ color: '#000' }}>e</Text>
              <Text style={{ color: '#8e0c0c' }}>d</Text>
              <Text style={{ color: '#000' }}>e</Text>
              <Text style={{ color: '#8e0c0c' }}>r</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Image
          source={require('../../assets/chef.png')}
          style={styles.chef}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    width: '100%',
  },
  topBar: {
    backgroundColor: '#8e0c0c',
    height: 40,
    borderBottomWidth: 4,
    borderBottomColor: '#000',
    width: width,
    alignSelf: 'center',
  },
  middleSection: {
    flex: 1,
    backgroundColor: '#fff9ea',
    width: width,
    alignSelf: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  ingresar: {
    fontSize: 48,
    fontStyle: 'Poppins Bold',
    fontWeight: '600',
    color: '#8e0c0c',
    fontFamily: Platform.select({
      ios: 'Snell Roundhand',
      android: 'cursive',
      default: 'serif',
    }),
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    width: width * 0.9,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8e0c0c',
    marginBottom: 6,
    letterSpacing: 1.2,
  },
  input: {
    backgroundColor: '#8e0c0c',
    color: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#fff9ea',
  },
  boton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  botonTexto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  olvidasteTexto: {
    color: '#8e0c0c',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  },
  footer: {
    backgroundColor: '#8e0c0c',
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 4,
    borderTopColor: '#000',
    width: width,
    alignSelf: 'center',
  },
  chef: {
    width: 210,
    height: 210,
  },
});
