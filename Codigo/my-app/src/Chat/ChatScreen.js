import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { useAccessibility } from '../context/AccesibilityContext';

const ChatScreen = ({ navigation, route }) => {
  const { conversationId, otherUser } = route.params;
  const { settings, fontSize } = useAccessibility();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const currentUserId = auth.currentUser?.uid;
  const flatListRef = useRef(null);

  useEffect(() => {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);
      setLoading(false);

      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    // Marcar mensajes como leídos
    markMessagesAsRead();

    return unsubscribe;
  }, [conversationId]);

  const markMessagesAsRead = async () => {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`unreadCount.${currentUserId}`]: 0
      });
    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        senderId: currentUserId,
        timestamp: serverTimestamp(),
      });

      // Actualizar última conversación
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: {
          text: newMessage.trim(),
          senderId: currentUserId,
          timestamp: serverTimestamp(),
        },
        [`unreadCount.${otherUser.id}`]: serverTimestamp(), // Incrementar contador para el otro usuario
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === currentUserId;

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myBubble : styles.otherBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText,
            settings.largeText && { fontSize: fontSize },
            settings.boldText && { fontWeight: '500' }
          ]}>
            {item.text}
          </Text>
          {item.timestamp && (
            <Text style={[
              styles.messageTime,
              settings.largeText && { fontSize: fontSize - 2 }
            ]}>
              {item.timestamp.toDate().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          )}
        </View>
      </View>
    );
  };

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
        
        <View style={styles.headerInfo}>
          <Text style={[
            styles.headerName,
            settings.largeText && { fontSize: fontSize + 2 },
            settings.boldText && { fontWeight: 'bold' }
          ]}>
            {otherUser?.name || 'Usuario'}
          </Text>
          <Text style={[
            styles.headerStatus,
            settings.largeText && { fontSize: fontSize - 2 }
          ]}>
            En línea
          </Text>
        </View>
        
        <View style={styles.headerButton} />
      </View>

      {/* Lista de mensajes */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B0000" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={[
                styles.emptyStateText,
                settings.largeText && { fontSize: fontSize },
                settings.boldText && { fontWeight: '500' }
              ]}>
                No hay mensajes aún
              </Text>
              <Text style={[
                styles.emptyStateSubtext,
                settings.largeText && { fontSize: fontSize - 2 }
              ]}>
                Envía el primer mensaje
              </Text>
            </View>
          )}
        />
      )}

      {/* Input de mensaje */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={[
          styles.inputWrapper,
          settings.darkMode && styles.darkCard
        ]}>
          <TextInput
            style={[
              styles.textInput,
              settings.largeText && { fontSize: fontSize },
              settings.boldText && { fontWeight: '500' }
            ]}
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
            placeholderTextColor={settings.darkMode ? "#999" : "#666"}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.disabledButton]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

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
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFA500',
  },
  headerStatus: {
    fontSize: 12,
    color: '#8B0000',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 15,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 10,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 5,
  },
  myBubble: {
    backgroundColor: '#8B0000',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFF',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 5,
    opacity: 0.7,
  },
  inputContainer: {
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#8B0000',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  bottomWave: {
    height: 30,
    backgroundColor: '#8B0000',
  },
});

export default ChatScreen;
