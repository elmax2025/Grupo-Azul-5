import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PrivacySecurity = ({ navigation }) => {
  const [settings, setSettings] = useState({
    privateAccount: false,
    showOnlineStatus: true,
    allowTags: true,
    allowComments: true,
    showActivity: true,
    dataSaver: false
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleBlockedUsers = () => {
    Alert.alert('Usuarios Bloqueados', 'Esta función te mostrará la lista de usuarios que has bloqueado.');
  };

  const handleDataDownload = () => {
    Alert.alert('Descargar Datos', 'Solicitando una copia de tus datos... Esto puede tomar hasta 48 horas.');
  };

  const PrivacyOption = ({ iconName, title, description, value, onToggle, toggle = true }) => (
    <View style={styles.option}>
      <View style={styles.optionLeft}>
        <Ionicons name={iconName} size={24} color="#8B0000" style={styles.optionIcon} />
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>{title}</Text>
          <Text style={styles.optionDescription}>{description}</Text>
        </View>
      </View>
      {toggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
        />
      ) : (
        <TouchableOpacity onPress={onToggle}>
          <Text style={styles.actionText}>Gestionar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B0000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacidad y Seguridad</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cuenta Privada */}
        <PrivacyOption
          iconName={settings.privateAccount ? "eye-off-outline" : "eye-outline"}
          title="Cuenta Privada"
          description="Solo tus seguidores pueden ver tus publicaciones"
          value={settings.privateAccount}
          onToggle={() => handleToggle('privateAccount')}
        />

        {/* Estado en Línea */}
        <PrivacyOption
          iconName={settings.showOnlineStatus ? "eye-outline" : "eye-off-outline"}
          title="Mostrar Estado en Línea"
          description="Permite que otros vean cuando estás en línea"
          value={settings.showOnlineStatus}
          onToggle={() => handleToggle('showOnlineStatus')}
        />

        {/* Etiquetas */}
        <PrivacyOption
          iconName="person-remove-outline"
          title="Permitir Etiquetas"
          description="Permite que otros usuarios te etiqueten en publicaciones"
          value={settings.allowTags}
          onToggle={() => handleToggle('allowTags')}
        />

        {/* Comentarios */}
        <PrivacyOption
          iconName="lock-closed-outline"
          title="Permitir Comentarios"
          description="Permite comentarios en tus publicaciones"
          value={settings.allowComments}
          onToggle={() => handleToggle('allowComments')}
        />

        {/* Actividad */}
        <PrivacyOption
          iconName="eye-outline"
          title="Mostrar Actividad"
          description="Muestra tu actividad reciente a otros usuarios"
          value={settings.showActivity}
          onToggle={() => handleToggle('showActivity')}
        />

        {/* Ahorro de Datos */}
        <PrivacyOption
          iconName="shield-checkmark-outline"
          title="Modo Ahorro de Datos"
          description="Reduce el uso de datos al cargar contenido"
          value={settings.dataSaver}
          onToggle={() => handleToggle('dataSaver')}
        />

        {/* Usuarios Bloqueados */}
        <PrivacyOption
          iconName="person-remove-outline"
          title="Usuarios Bloqueados"
          description="Gestiona la lista de usuarios que has bloqueado"
          value={false}
          onToggle={handleBlockedUsers}
          toggle={false}
        />

        {/* Descargar Datos */}
        <PrivacyOption
          iconName="shield-checkmark-outline"
          title="Descargar Tus Datos"
          description="Solicita una copia de toda tu información"
          value={false}
          onToggle={handleDataDownload}
          toggle={false}
        />

        {/* Información de Seguridad */}
        <View style={styles.securityInfo}>
          <Text style={styles.securityTitle}>Consejos de Seguridad</Text>
          <Text style={styles.securityTip}>• No compartas tu contraseña con nadie</Text>
          <Text style={styles.securityTip}>• Usa una contraseña única y segura</Text>
          <Text style={styles.securityTip}>• Revisa regularmente tu actividad</Text>
          <Text style={styles.securityTip}>• Mantén tu aplicación actualizada</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  actionText: {
    color: '#8B0000',
    fontWeight: '600',
    fontSize: 14,
  },
  securityInfo: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  securityTip: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default PrivacySecurity;
