// SearchUsersScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

const SearchUsersScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState([]);
  const currentUserId = auth.currentUser?.uid;

  // Cargar todos los usuarios y los que seguimos
  useEffect(() => {
    loadUsers();
    loadFollowing();
  }, []);

  // Filtrar usuarios según la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers([]);
    } else {
      const filtered = users.filter(user =>
        user.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, 'Spaghetti', 'Usuario', 'Usuario');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(user => user.id !== currentUserId); // Excluir al usuario actual

      setUsers(usersList);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadFollowing = async () => {
    if (!currentUserId) return;

    try {
      const userDocRef = doc(db, 'Spaghetti', 'Usuario', 'Usuario', currentUserId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFollowing(userData.following || []);
      }
    } catch (error) {
      console.error('Error cargando seguidos:', error);
    }
  };

  const handleFollow = async (userId) => {
    if (!currentUserId) {
      Alert.alert('Error', 'Debes iniciar sesión para seguir usuarios');
      return;
    }

    try {
      const currentUserRef = doc(db, 'Spaghetti', 'Usuario', 'Usuario', currentUserId);
      
      if (following.includes(userId)) {
        // Dejar de seguir
        await updateDoc(currentUserRef, {
          following: arrayRemove(userId)
        });
        setFollowing(prev => prev.filter(id => id !== userId));
      } else {
        // Seguir
        await updateDoc(currentUserRef, {
          following: arrayUnion(userId)
        });
        setFollowing(prev => [...prev, userId]);
      }
    } catch (error) {
      console.error('Error actualizando seguimiento:', error);
      Alert.alert('Error', 'No se pudo actualizar el seguimiento');
    }
  };

  const handleViewProfile = (userId) => {
    // Navegar al perfil del usuario
    navigation.navigate('UserProfile', { userId });
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => handleViewProfile(item.id)}
    >
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={24} color="#8B0000" />
          )}
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.nombre || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
      </View>
      
      <View style={styles.userActions}>
        <TouchableOpacity 
          style={[
            styles.followButton,
            following.includes(item.id) && styles.unfollowButton
          ]}
          onPress={(e) => {
            e.stopPropagation(); // Evitar que se active el onPress de la tarjeta
            handleFollow(item.id);
          }}
        >
          <Text style={[
            styles.followButtonText,
            following.includes(item.id) && styles.unfollowButtonText
          ]}>
            {following.includes(item.id) ? 'Siguiendo' : 'Seguir'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#8B0000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buscar Usuarios</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de resultados */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B0000" />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      ) : searchQuery.trim() === '' ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={80} color="#CCC" />
          <Text style={styles.emptyStateText}>Busca usuarios por nombre o email</Text>
          <Text style={styles.emptyStateSubtext}>
            Encuentra amigos y sigue a otros usuarios para ver sus publicaciones
          </Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={80} color="#CCC" />
          <Text style={styles.emptyStateText}>No se encontraron usuarios</Text>
          <Text style={styles.emptyStateSubtext}>
            Intenta con otro nombre o email
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          style={styles.usersList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
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
    justifyContent: 'space-between',
    backgroundColor: '#000',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFA500',
  },
  headerPlaceholder: {
    width: 34,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  usersList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  userCard: {
    backgroundColor: '#FFF',
    marginVertical: 8,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  followButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#8B0000',
    borderRadius: 8,
  },
  unfollowButton: {
    backgroundColor: '#F5F5F5',
  },
  followButtonText: {
    color: '#FFA500',
    fontSize: 14,
    fontWeight: 'bold',
  },
  unfollowButtonText: {
    color: '#666',
  },
});

export default SearchUsersScreen;
