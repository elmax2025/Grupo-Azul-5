import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Componente de Toast
const Toast = ({ message, type, isVisible, onClose }) => {
  if (!isVisible) return null;

  const bgColor = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6';

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [isVisible, onClose]);

  return (
    <View style={[styles.toast, { backgroundColor: bgColor }]}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};

const UserConfig = ({ navigation }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'Spaghetti', 'Usuario', 'Usuario', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        }
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
      }
    };

    loadUserData();
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Handlers de navegación
  const handleAccountPress = () => {
    navigation.navigate('Perfil');
  };

  const handleLikesPress = () => {
    navigation.navigate('LikedPosts');
  };

  const handleSharesPress = () => {
    navigation.navigate('SharedPosts');
  };

  const handlePrivacyPress = () => {
    navigation.navigate('PrivacySecurity');
  };

  const handleDisplayPress = () => {
    navigation.navigate('Accesbilidad');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              showToast('Sesión cerrada exitosamente', 'success');
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error cerrando sesión:', error);
              showToast('Error al cerrar sesión', 'error');
            }
          }
        }
      ]
    );
  };

  // Temas
  const LIGHT_MODE = {
    background: '#E8D7B8',
    headerBorder: '#D4C5A9',
    buttonBg: '#6B1A1A',
    headerText: '#8B2020',
    closeButtonBg: '#E8C478',
    buttonTextColor: '#FFFFFF',
  };

  const DARK_MODE = {
    background: '#1A1A1A',
    headerBorder: '#2C2C2C',
    buttonBg: '#3A0000',
    headerText: '#F0F0F0',
    closeButtonBg: '#8B0000',
    buttonTextColor: '#FFFFFF',
  };

  const theme = isDarkMode ? DARK_MODE : LIGHT_MODE;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Toast {...toast} onClose={closeToast} />

      {/* Encabezado */}
      <View style={[styles.header, { borderColor: theme.headerBorder, backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.headerText }]}>Configuración</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Información del Usuario */}
        <View style={[styles.userInfoCard, { backgroundColor: theme.buttonBg }]}>
          <Ionicons name="person-circle" size={40} color="#FFFFFF" />
          <View style={styles.userInfoText}>
            <Text style={styles.userName}>
              {userData?.nombre || auth.currentUser?.email || 'Usuario'}
            </Text>
            <Text style={styles.userEmail}>{auth.currentUser?.email}</Text>
          </View>
        </View>

        {/* Tu Cuenta - REDIRIGE A PERFIL */}
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.buttonBg }]}
          onPress={handleAccountPress}
        >
          <Ionicons name="person-outline" size={28} color="white" />
          <Text style={[styles.optionText, { color: theme.buttonTextColor }]}>Tu Cuenta</Text>
        </TouchableOpacity>

        {/* Ver Me Gusta */}
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.buttonBg }]}
          onPress={handleLikesPress}
        >
          <Ionicons name="heart-outline" size={28} color="white" />
          <Text style={[styles.optionText, { color: theme.buttonTextColor }]}>Ver Me Gusta</Text>
        </TouchableOpacity>

        {/* Ver Compartidos */}
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.buttonBg }]}
          onPress={handleSharesPress}
        >
          <Ionicons name="share-social-outline" size={28} color="#D4AF37" />
          <Text style={[styles.optionText, { color: theme.buttonTextColor }]}>Ver Compartidos</Text>
        </TouchableOpacity>

        {/* Privacidad y Seguridad */}
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.buttonBg }]}
          onPress={handlePrivacyPress}
        >
          <Ionicons name="lock-closed-outline" size={28} color="white" />
          <Text style={[styles.optionText, { color: theme.buttonTextColor }]}>Privacidad y Seguridad</Text>
        </TouchableOpacity>

        {/* Accesibilidad */}
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.buttonBg }]}
          onPress={handleDisplayPress}
        >
          <Ionicons name="contrast-outline" size={28} color="white" />
          <Text style={[styles.optionText, { color: theme.buttonTextColor }]}>Accesibilidad</Text>
        </TouchableOpacity>

        {/* Cerrar Sesión */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.closeButtonBg }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: theme.buttonTextColor }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 2,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  userInfoText: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
    flex: 1,
  },
  logoutButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toast: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    zIndex: 1000,
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default UserConfig;
