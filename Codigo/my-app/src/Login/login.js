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
  ScrollView,
} from 'react-native';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';

const { width, height } = Dimensions.get('window');

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const handleLogin = async () => {
    if (!email || !contrasena) {
      Alert.alert('Error', 'Completá todos los campos.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, contrasena);
      const user = userCredential.user;
      Alert.alert('Éxito', `Bienvenido, ${user.email}`);
      navigation.navigate('Feed'); // 🔍 redirige a Feed
    } catch (error) {
      Alert.alert('Error al iniciar sesión', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.middleSection}>
          <Text style={styles.ingresar}>Ingresar</Text>
          <Text style={styles.subtitulo}>Iniciá sesión para continuar</Text>

          <View style={styles.form}>
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
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="******"
                placeholderTextColor="#fff9ea"
                secureTextEntry={!mostrarContrasena}
                value={contrasena}
                onChangeText={setContrasena}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setMostrarContrasena(!mostrarContrasena)}
              >
                <Text style={styles.eyeIcon}>
                  {mostrarContrasena ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Botón Acceder PRIMERO */}
            <TouchableOpacity style={styles.boton} onPress={handleLogin}>
              <Text style={styles.botonTexto}>Acceder</Text>
            </TouchableOpacity>

            {/* Enlaces juntos DEBAJO del botón Acceder */}
            <View style={styles.enlacesContainer}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Contraseñaperdida')}
              >
                <Text style={styles.textoLink}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => navigation.navigate('Registro')}
              >
                <Text style={styles.textoLink}>¿No tenés cuenta? Registrate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Reducido de 30 a 20
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
    minHeight: height * 0.7,
  },
  ingresar: {
    fontSize: 48,
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
    marginBottom: 30, // Reducido de 40 a 30
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8e0c0c',
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fff9ea',
  },
  passwordInput: {
    flex: 1,
    color: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  eyeButton: {
    paddingRight: 14,
    paddingVertical: 16,
  },
  eyeIcon: {
    fontSize: 20,
  },
  // Botón principal de Acceder
  boton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20, // Reducido de 25 a 20
    width: '100%',
    borderWidth: 2,
    borderColor: '#8e0c0c',
  },
  botonTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8e0c0c',
  },
  // Contenedor para los enlaces
  enlacesContainer: {
    alignItems: 'center',
    gap: 15,
  },
  // Estilo único para ambos textos de enlace
  textoLink: {
    color: '#8e0c0c',
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  },
  // Footer más pequeño
  footer: {
    backgroundColor: '#8e0c0c',
    alignItems: 'center',
    paddingVertical: 25, // Reducido de 24 a 15
    borderTopWidth: 4,
    borderTopColor: '#000',
    width: width,
    alignSelf: 'center',
  },
  chef: {
    width: 160, // Reducido de 210 a 160
    height: 160, // Reducido de 210 a 160
  },
});
