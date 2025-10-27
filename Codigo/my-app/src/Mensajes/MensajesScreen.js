import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { useAccessibility } from '../context/AccesibilityContext';

const MensajesScreen = ({ navigation, route }) => {
  const { settings, fontSize } = useAccessibility();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const currentUserId = auth.currentUser?.uid;
  const searchTimeoutRef = useRef(null);

  // Función para navegar con feedback háptico
  const handleNavigationWithFeedback = (screen, params = {}) => {
    if (settings.hapticFeedback) {
      Vibration.vibrate(50);
    }
    navigation.navigate(screen, params);
  };

  // Cargar conversaciones del usuario
  useEffect(() => {
    if (!currentUserId) return;

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', currentUserId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const conversationsData = [];
        
        for (const docSnapshot of snapshot.docs) {
          const conversation = {
            id: docSnapshot.id,
            ...docSnapshot.data()
          };

          // Obtener información del otro participante
          const otherParticipantId = conversation.participants.find(
            id => id !== currentUserId
          );

          if (otherParticipantId) {
            // Obtener datos del usuario
            const userDoc = await getDoc(doc(db, 'Spaghetti', 'Usuario', 'Usuario', otherParticipantId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              conversation.otherUser = {
                id: otherParticipantId,
                name: userData.nombre || 'Usuario',
                email: userData.email,
                avatar: userData.avatar
              };
            } else {
              conversation.otherUser = {
                id: otherParticipantId,
                name: 'Usuario',
                email: '',
                avatar: null
              };
            }
          }

          conversationsData.push(conversation);
        }

        // Ordenar por último mensaje
        conversationsData.sort((a, b) => {
          const timeA = a.lastMessage?.timestamp?.toDate() || new Date(0);
          const timeB = b.lastMessage?.timestamp?.toDate() || new Date(0);
          return timeB - timeA;
        });

        setConversations(conversationsData);
        setLoading(false);
      } catch (error) {
        console.error('Error cargando conversaciones:', error);
        setLoading(false);
      }
    }, (error) => {
      console.error('Error en snapshot:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUserId]);

  // Búsqueda en tiempo real
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Configurar nuevo timeout para búsqueda
    searchTimeoutRef.current = setTimeout(() => {
      searchUsers();
    }, 300); // 300ms de delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Buscar usuarios por nombre o email
  const searchUsers = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const usersRef = collection(db, 'Spaghetti', 'Usuario', 'Usuario');
      const searchTerm = searchQuery.toLowerCase().trim();
      
      // Obtener todos los usuarios y filtrar localmente para búsqueda más flexible
      const querySnapshot = await getDocs(usersRef);
      const users = [];

      querySnapshot.forEach((docSnapshot) => {
        const userData = docSnapshot.data();
        const userName = userData.nombre?.toLowerCase() || '';
        const userEmail = userData.email?.toLowerCase() || '';
        
        // Excluir al usuario actual y buscar por nombre o email
        if (docSnapshot.id !== currentUserId && 
            (userName.includes(searchTerm) || userEmail.includes(searchTerm))) {
          
          // Verificar si ya existe una conversación con este usuario
          const existingConversation = conversations.find(conv => 
            conv.participants.includes(docSnapshot.id)
          );

          users.push({
            id: docSnapshot.id,
            name: userData.nombre || 'Usuario',
            email: userData.email,
            avatar: userData.avatar,
            hasExistingConversation: !!existingConversation,
            existingConversationId: existingConversation?.id,
            ...userData
          });
        }
      });

      // Ordenar resultados: primero los que coinciden con el nombre, luego con email
      users.sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().includes(searchTerm);
        const bNameMatch = b.name.toLowerCase().includes(searchTerm);
        
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        return a.name.localeCompare(b.name);
      });

      setSearchResults(users);
      setShowSearchResults(true);
      setSearching(false);

    } catch (error) {
      console.error('Error buscando usuarios:', error);
      Alert.alert('Error', 'No se pudo buscar usuarios');
      setSearching(false);
    }
  };

  // Iniciar nueva conversación o abrir existente
  const handleUserPress = async (user) => {
    try {
      // Si ya existe conversación, abrirla
      if (user.hasExistingConversation && user.existingConversationId) {
        handleNavigationWithFeedback('Chat', {
          conversationId: user.existingConversationId,
          otherUser: user
        });
      } else {
        // Crear nueva conversación
        const newConversation = {
          participants: [currentUserId, user.id],
          createdAt: serverTimestamp(),
          lastMessage: {
            text: '¡Hola! 👋',
            senderId: currentUserId,
            timestamp: serverTimestamp()
          },
          unreadCount: {
            [currentUserId]: 0,
            [user.id]: 1
          }
        };

        const docRef = await addDoc(collection(db, 'conversations'), newConversation);
        
        // Agregar el mensaje inicial
        const messagesRef = collection(db, 'conversations', docRef.id, 'messages');
        await addDoc(messagesRef, {
          text: '¡Hola! 👋',
          senderId: currentUserId,
          timestamp: serverTimestamp(),
        });
        
        handleNavigationWithFeedback('Chat', {
          conversationId: docRef.id,
          otherUser: user
        });
      }

      setSearchQuery('');
      setShowSearchResults(false);
      setSearchResults([]);
    } catch (error) {
      console.error('Error manejando usuario:', error);
      Alert.alert('Error', 'No se pudo iniciar la conversación');
    }
  };

  // Renderizar item de conversación existente
  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        settings.darkMode && styles.darkCard,
        settings.highContrast && styles.highContrastCard
      ]}
      onPress={() => handleNavigationWithFeedback('Chat', {
        conversationId: item.id,
        otherUser: item.otherUser
      })}
    >
      <View style={styles.avatarContainer}>
        {item.otherUser?.avatar ? (
          <Image source={{ uri: item.otherUser.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.defaultAvatar}>
            <Ionicons name="person" size={20} color="#8B0000" />
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[
            styles.userName,
            settings.largeText && { fontSize: fontSize + 2 },
            settings.boldText && { fontWeight: 'bold' }
          ]}>
            {item.otherUser?.name || 'Usuario'}
          </Text>
          {item.lastMessage?.timestamp && (
            <Text style={[
              styles.time,
              settings.largeText && { fontSize: fontSize - 2 }
            ]}>
              {formatTime(item.lastMessage.timestamp.toDate())}
            </Text>
          )}
        </View>

        <Text
          style={[
            styles.lastMessage,
            settings.largeText && { fontSize: fontSize },
            settings.boldText && { fontWeight: '500' }
          ]}
          numberOfLines={2}
        >
          {item.lastMessage?.text || 'Inicia una conversación'}
        </Text>
      </View>

      {item.unreadCount && item.unreadCount[currentUserId] > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>
            {item.unreadCount[currentUserId]}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Renderizar resultado de búsqueda de usuario
  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.searchResultItem,
        settings.darkMode && styles.darkCard,
        settings.highContrast && styles.highContrastCard
      ]}
      onPress={() => handleUserPress(item)}
    >
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.defaultAvatar}>
            <Ionicons name="person" size={20} color="#8B0000" />
          </View>
        )}
      </View>

      <View style={styles.searchResultContent}>
        <View style={styles.userInfo}>
          <Text style={[
            styles.userName,
            settings.largeText && { fontSize: fontSize + 2 },
            settings.boldText && { fontWeight: 'bold' }
          ]}>
            {item.name}
          </Text>
          {item.hasExistingConversation && (
            <View style={styles.existingConversationBadge}>
              <Text style={styles.existingConversationText}>Conversación existente</Text>
            </View>
          )}
        </View>
        <Text style={[
          styles.userEmail,
          settings.largeText && { fontSize: fontSize - 2 }
        ]}>
          {item.email}
        </Text>
      </View>

      <View style={[
        styles.chatButton,
        item.hasExistingConversation && styles.existingChatButton
      ]}>
        <Ionicons 
          name={item.hasExistingConversation ? "chatbubble" : "chatbubble-ellipses-outline"} 
          size={20} 
          color={item.hasExistingConversation ? "#FFF" : "#8B0000"} 
        />
      </View>
    </TouchableOpacity>
  );

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else if (days < 7) {
      return `${days}d`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    // Mostrar estado de búsqueda inmediatamente
    if (text.trim().length >= 2) {
      setSearching(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
    setSearching(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[
        styles.container,
        settings.darkMode && styles.darkContainer,
        settings.highContrast && styles.highContrastContainer
      ]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B0000" />
          <Text style={[
            styles.loadingText,
            settings.largeText && { fontSize: fontSize },
            settings.boldText && { fontWeight: '500' }
          ]}>
            Cargando conversaciones...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[
      styles.container,
      settings.darkMode && styles.darkContainer,
      settings.highContrast && styles.highContrastContainer
    ]}>
      <StatusBar 
        backgroundColor={settings.darkMode ? "#1a1a1a" : "#000"} 
        barStyle={settings.darkMode ? "light-content" : "light-content"} 
      />

      {/* Header */}
      <View style={[
        styles.header,
        settings.darkMode && styles.darkHeader,
        settings.highContrast && styles.highContrastHeader
      ]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="#8B0000" />
        </TouchableOpacity>
        
        <Text style={[
          styles.headerTitle,
          settings.largeText && { fontSize: fontSize + 4 },
          settings.boldText && { fontWeight: 'bold' }
        ]}>
          Mensajes
        </Text>
        
        <View style={styles.headerButton} />
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchInputContainer,
          settings.darkMode && styles.darkCard
        ]}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={[
              styles.searchInput,
              settings.largeText && { fontSize: fontSize },
              settings.boldText && { fontWeight: '500' }
            ]}
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            placeholderTextColor={settings.darkMode ? "#999" : "#666"}
          />
          {searching ? (
            <ActivityIndicator size="small" color="#8B0000" />
          ) : searchQuery.length > 0 ? (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Indicador de búsqueda mínima */}
      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <View style={styles.minSearchIndicator}>
          <Text style={[
            styles.minSearchText,
            settings.largeText && { fontSize: fontSize - 2 }
          ]}>
            Escribe al menos 2 caracteres...
          </Text>
        </View>
      )}

      {/* Resultados de búsqueda */}
      {showSearchResults && (
        <View style={styles.searchResultsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[
              styles.sectionTitle,
              settings.largeText && { fontSize: fontSize + 2 },
              settings.boldText && { fontWeight: 'bold' }
            ]}>
              Usuarios encontrados ({searchResults.length})
            </Text>
            <TouchableOpacity onPress={clearSearch}>
              <Text style={styles.clearSearchText}>Limpiar</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={item => item.id}
            style={styles.searchResultsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={40} color="#CCC" />
                <Text style={[
                  styles.noResultsText,
                  settings.largeText && { fontSize: fontSize },
                  settings.boldText && { fontWeight: '500' }
                ]}>
                  No se encontraron usuarios
                </Text>
                <Text style={[
                  styles.noResultsSubtext,
                  settings.largeText && { fontSize: fontSize - 2 }
                ]}>
                  Intenta con otro nombre o email
                </Text>
              </View>
            )}
          />
        </View>
      )}

      {/* Lista de conversaciones existentes */}
      {!showSearchResults && searchQuery.length < 2 && (
        <View style={styles.conversationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[
              styles.sectionTitle,
              settings.largeText && { fontSize: fontSize + 2 },
              settings.boldText && { fontWeight: 'bold' }
            ]}>
              Conversaciones ({conversations.length})
            </Text>
          </View>
          
          <FlatList
            data={conversations}
            renderItem={renderConversationItem}
            keyExtractor={item => item.id}
            style={styles.conversationsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubble-ellipses-outline" size={80} color="#CCC" />
                <Text style={[
                  styles.emptyStateText,
                  settings.largeText && { fontSize: fontSize + 2 },
                  settings.boldText && { fontWeight: 'bold' }
                ]}>
                  No hay conversaciones
                </Text>
                <Text style={[
                  styles.emptyStateSubtext,
                  settings.largeText && { fontSize: fontSize },
                  settings.boldText && { fontWeight: '500' }
                ]}>
                  Busca usuarios arriba para iniciar una conversación
                </Text>
              </View>
            )}
          />
        </View>
      )}

      <View style={[
        styles.bottomWave,
        settings.darkMode && styles.darkBottomWave,
        settings.highContrast && styles.highContrastBottomWave
      ]} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  highContrastContainer: {
    backgroundColor: '#000000',
  },
  darkCard: {
    backgroundColor: '#2d2d2d',
  },
  highContrastCard: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  darkHeader: {
    backgroundColor: '#000000',
  },
  highContrastHeader: {
    backgroundColor: '#000000',
    borderBottomColor: '#FFFFFF',
    borderBottomWidth: 2,
  },
  darkBottomWave: {
    backgroundColor: '#8B0000',
  },
  highContrastBottomWave: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerButton: {
    padding: 5,
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFA500',
    textAlign: 'center',
  },
  searchContainer: {
    padding: 15,
    paddingBottom: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  minSearchIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  minSearchText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Secciones
  searchResultsSection: {
    flex: 1,
    paddingHorizontal: 15,
  },
  conversationsSection: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  clearSearchText: {
    color: '#8B0000',
    fontSize: 14,
    fontWeight: '500',
  },
  // Resultados de búsqueda
  searchResultsList: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchResultContent: {
    flex: 1,
    marginLeft: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
  },
  existingConversationBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  existingConversationText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: '500',
  },
  chatButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  existingChatButton: {
    backgroundColor: '#8B0000',
  },
  // Conversaciones existentes
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  unreadBadge: {
    backgroundColor: '#8B0000',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  unreadCount: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Estados
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  bottomWave: {
    height: 50,
    backgroundColor: '#8B0000',
  },
});

export default MensajesScreen;
