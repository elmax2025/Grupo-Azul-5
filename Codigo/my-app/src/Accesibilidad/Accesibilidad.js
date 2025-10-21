import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Vibration,
} from 'react-native';
import { useAccessibility } from '../context/AccesibilityContext'; // Ajusta la ruta

const Accesibilidad = ({ navigation }) => {
  const { 
    settings, 
    fontSize, 
    updateSettings, 
    updateFontSize, 
    toggleSetting 
  } = useAccessibility();

  const handleToggle = (setting) => {
    toggleSetting(setting);
    
    // Feedback de vibración
    if (settings.hapticFeedback) {
      Vibration.vibrate(50);
    }
  };

  const testHapticFeedback = () => {
    Vibration.vibrate(100);
  };

  const testSoundNotification = () => {
    if (settings.soundNotifications) {
      Vibration.vibrate(200);
      Alert.alert('Notificación de prueba', '🔊 Sonido de notificación');
    }
  };

  const testVoiceCommands = () => {
    Alert.alert(
      'Comandos de Voz',
      'Activa "Texto a Voz" para usar comandos de voz en la aplicación.',
      [{ text: 'Entendido' }]
    );
  };

  const OptionItem = ({ title, description, value, onToggle, showTest = false, testAction }) => (
    <View style={styles.option}>
      <View style={styles.optionText}>
        <Text style={[
          styles.optionTitle,
          settings.largeText && { fontSize: 18 },
          settings.boldText && { fontWeight: 'bold' }
        ]}>
          {title}
        </Text>
        <Text style={[
          styles.optionDescription,
          settings.largeText && { fontSize: 14 }
        ]}>
          {description}
        </Text>
      </View>
      
      <View style={styles.optionRight}>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
        />
        
        {showTest && value && (
          <TouchableOpacity onPress={testAction} style={styles.testButton}>
            <Text style={styles.testText}>Probar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <View style={[
      styles.container,
      settings.darkMode && styles.darkContainer,
      settings.highContrast && styles.highContrastContainer
    ]}>
      {/* Header Simple */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accesibilidad</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* VISIÓN */}
        <Section title="Visión">
          <OptionItem
            title="Modo Oscuro"
            description="Fondo oscuro para reducir fatiga visual"
            value={settings.darkMode}
            onToggle={() => handleToggle('darkMode')}
          />

          <OptionItem
            title="Texto Grande"
            description="Aumenta el tamaño del texto"
            value={settings.largeText}
            onToggle={() => handleToggle('largeText')}
          />

          <OptionItem
            title="Texto en Negrita"
            description="Texto más grueso para mejor legibilidad"
            value={settings.boldText}
            onToggle={() => handleToggle('boldText')}
          />

          <OptionItem
            title="Alto Contraste"
            description="Mejora el contraste de colores"
            value={settings.highContrast}
            onToggle={() => handleToggle('highContrast')}
          />

          {/* Control de tamaño de texto manual */}
          <View style={styles.sizeControl}>
            <Text style={styles.sizeLabel}>Tamaño de texto: {fontSize}px</Text>
            <View style={styles.sizeButtons}>
              <TouchableOpacity 
                style={styles.sizeButton}
                onPress={() => updateFontSize(Math.max(12, fontSize - 2))}
              >
                <Text style={styles.sizeButtonText}>A-</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.sizeButton}
                onPress={() => updateFontSize(Math.min(24, fontSize + 2))}
              >
                <Text style={styles.sizeButtonText}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Section>

        {/* AUDIO */}
        <Section title="Audio">
          <OptionItem
            title="Notificaciones de Sonido"
            description="Sonidos para alertas importantes"
            value={settings.soundNotifications}
            onToggle={() => handleToggle('soundNotifications')}
            showTest={true}
            testAction={testSoundNotification}
          />

          <OptionItem
            title="Texto a Voz"
            description="Lee el contenido en voz alta"
            value={settings.textToSpeech}
            onToggle={() => handleToggle('textToSpeech')}
            showTest={true}
            testAction={testVoiceCommands}
          />
        </Section>

        {/* INTERACCIÓN */}
        <Section title="Interacción">
          <OptionItem
            title="Feedback Háptico"
            description="Vibraciones al interactuar"
            value={settings.hapticFeedback}
            onToggle={() => handleToggle('hapticFeedback')}
            showTest={true}
            testAction={testHapticFeedback}
          />

          <OptionItem
            title="Reducir Animaciones"
            description="Minimiza movimientos en la interfaz"
            value={settings.reduceMotion}
            onToggle={() => handleToggle('reduceMotion')}
          />

          <OptionItem
            title="Diseño Simplificado"
            description="Interfaz más simple y limpia"
            value={settings.simplifiedLayout}
            onToggle={() => handleToggle('simplifiedLayout')}
          />
        </Section>

        {/* ACCIONES RÁPIDAS */}
        <Section title="Acciones Rápidas">
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => {
                const newSettings = {
                  ...settings,
                  largeText: true,
                  boldText: true,
                  highContrast: true
                };
                updateSettings(newSettings);
                Alert.alert('Modo activado', 'Alta visibilidad activada');
              }}
            >
              <Text style={styles.quickButtonText}>Alta Visibilidad</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => {
                const defaultSettings = {
                  darkMode: false,
                  largeText: false,
                  boldText: false,
                  highContrast: false,
                  textToSpeech: false,
                  hapticFeedback: true,
                  soundNotifications: true,
                  simplifiedLayout: false,
                  reduceMotion: false,
                };
                updateSettings(defaultSettings);
                updateFontSize(16);
                Alert.alert('Configuración restablecida');
              }}
            >
              <Text style={styles.quickButtonText}>Restablecer</Text>
            </TouchableOpacity>
          </View>
        </Section>

        {/* INFORMACIÓN */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Configuración Activada</Text>
          <Text style={styles.infoText}>
            {Object.values(settings).filter(Boolean).length} de {Object.values(settings).length} opciones
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  highContrastContainer: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B0000',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    flex: 1,
    marginRight: 10,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  testText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sizeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  sizeLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  sizeButtons: {
    flexDirection: 'row',
  },
  sizeButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 5,
  },
  sizeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
});

export default Accesibilidad;
