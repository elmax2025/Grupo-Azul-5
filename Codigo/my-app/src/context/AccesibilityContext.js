import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config'; // Ruta hacia arriba
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility debe ser usado dentro de un AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    darkMode: false,
    largeText: false,
    boldText: false,
    highContrast: false,
    textToSpeech: false,
    hapticFeedback: true,
    soundNotifications: true,
    simplifiedLayout: false,
    reduceMotion: false,
  });
  
  const [fontSize, setFontSize] = useState(16);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Escuchar cambios en la autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadUserSettings(user.uid);
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Cargar configuraciones desde Firestore
  const loadUserSettings = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.accessibilitySettings) {
          setSettings(userData.accessibilitySettings);
        }
        if (userData.fontSize) {
          setFontSize(userData.fontSize);
        }
      }
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Guardar configuraciones en Firestore
  const saveSettings = async (newSettings) => {
    if (!currentUser) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        accessibilitySettings: newSettings,
        fontSize: fontSize,
        lastUpdated: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error guardando configuraciones:', error);
    }
  };

  // Escuchar cambios en tiempo real
  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        if (userData.accessibilitySettings) {
          setSettings(userData.accessibilitySettings);
        }
        if (userData.fontSize) {
          setFontSize(userData.fontSize);
        }
      }
    });

    return unsubscribe;
  }, [currentUser]);

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const updateFontSize = (newFontSize) => {
    setFontSize(newFontSize);
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      setDoc(userDocRef, {
        fontSize: newFontSize,
        lastUpdated: new Date()
      }, { merge: true });
    }
  };

  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    updateSettings(newSettings);
  };

  const value = {
    settings,
    fontSize,
    loading,
    updateSettings,
    updateFontSize,
    toggleSetting
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
