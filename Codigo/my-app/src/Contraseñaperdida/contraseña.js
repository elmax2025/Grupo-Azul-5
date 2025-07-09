import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';

import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';

const { height } = Dimensions.get('window');

const PasswordRecoveryScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresá tu correo electrónico.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email, {
        url: 'https://spaghetti-e2346.firebaseapp.com/reset-password',
      });
      Alert.alert(
        'Correo enviado',
        'Te enviamos un correo para restablecer tu contraseña.'
      );
      navigation.goBack(); // o navigation.navigate('Login');
    } catch (error) {
      console.log(error);
      let mensaje = 'Ocurrió un error. Verificá el correo.';
      if (error.code === 'auth/user-not-found') {
        mensaje = 'No se encontró un usuario con ese correo.';
      } else if (error.code === 'auth/invalid-email') {
        mensaje = 'Correo electrónico inválido.';
      }
      Alert.alert('Error', mensaje);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff9ea" />
      <View style={styles.topBar} />

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
          ¿Olvidaste la contraseña?
        </Text>
        <Text style={styles.subtitle}>Generá una nueva.</Text>

        <Text style={styles.label}>EMAIL</Text>
        <TextInput
          style={styles.input}
          placeholder="hola@sitioincreible.com.ar"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#BFBFBF"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
          <Text style={styles.buttonText}>Enviar</Text>
        </TouchableOpacity>
      </View>

      <ImageBackground
        source={require('../../assets/foto contraseña olvidada.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9ea',
    justifyContent: 'flex-start',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#8e0c0c',
    borderBottomWidth: 3,
    borderBottomColor: '#000',
    zIndex: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 110,
    paddingBottom: height * 0.25,
    zIndex: 1,
  },
  title: {
    fontSize: 38,
    lineHeight: 52,
    fontWeight: '600',
    color: '#8e0c0c',
    fontFamily: Platform.select({
      ios: 'Snell Roundhand',
      android: 'cursive',
      default: 'serif',
    }),
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    color: '#8e0c0c',
    marginBottom: 30,
    fontWeight: '500',
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
    color: '#8e0c0c',
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 1,
  },
  input: {
    height: 58,
    borderWidth: 1.2,
    borderColor: '#8e0c0c',
    borderRadius: 0,
    paddingHorizontal: 14,
    backgroundColor: '#000',
    marginBottom: 25,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#8e0c0c',
    height: 58,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  backgroundImage: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '100%',
    height: height * 0.5,
    zIndex: 0,
  },
});

export default PasswordRecoveryScreen;
