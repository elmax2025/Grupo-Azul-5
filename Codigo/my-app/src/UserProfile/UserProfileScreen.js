// UserProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const currentUserId = auth.currentUser?.uid;

  // Cargar perfil del usuario y verificar si lo seguimos
  useEffect(() => {
    loadUserProfile();
    loadUserPosts();
    checkIfFollowing();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const userDocRef = doc(db, 'Spaghetti', 'Usuario', 'Usuario', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile({
          id: userId,
          nombre: userData.nombre || 'Usuario',
          descripcion: userData.descripcion || 'Sin descripción',
          avatar: userData.avatar || '',
          fechaRegistro: userData.fechaRegistro || 'Fecha desconocida',
          email: userData.email || ''
        });
      } else {
        Alert.alert('Error', 'Usuario no encontrado');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error cargando perfil de usuario:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = () => {
    const postsQuery = query(
      collection(db, 'Spaghetti/Publicaciones/Publicaciones'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar localmente por fecha
      postsData.sort((a, b) => {
        try {
          const dateA = a.Fecha_publicacion ? a.Fecha_publicacion.toDate() : new Date(0);
          const dateB = b.Fecha_publicacion ? b.Fecha_publicacion.toDate() : new Date(0);
          return dateB - dateA;
        } catch (error) {
          return 0;
        }
      });
      
      setUserPosts(postsData);
    });

    return unsubscribe;
  };

  const checkIfFollowing = async () => {
    if (!currentUserId) return;

    try {
      const currentUserRef = doc(db, 'Spaghetti', 'Usuario', 'Usuario', currentUserId);
      const currentUserDoc = await getDoc(currentUserRef);
      
      if (currentUserDoc.exists()) {
        const userData = currentUserDoc.data();
        const following = userData.following || [];
        setIsFollowing(following.includes(userId));
      }
    } catch (error) {
      console.error('Error verificando seguimiento:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUserId) {
      Alert.alert('Error', 'Debes iniciar sesión para seguir usuarios');
      return;
    }

    try {
      const currentUserRef = doc(db, 'Spaghetti', 'Usuario', 'Usuario', currentUserId);
      
      if (isFollowing) {
        // Dejar de seguir
        await updateDoc(currentUserRef, {
          following: arrayRemove(userId)
        });
        setIsFollowing(false);
      } else {
        // Seguir
        await updateDoc(currentUserRef, {
          following: arrayUnion(userId)
        });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error actualizando seguimiento:', error);
      Alert.alert('Error', 'No se pudo actualizar el seguimiento');
    }
  };

  const PostCard = ({ post }) => (
    <View style={styles.postCard}>
      <Text style={styles.postTitle}>{post.Titulo || 'Título'}</Text>
      <Text style={styles.postDescription}>{post.Descripcion || 'Descripción'}</Text>
      {post.ImagenBase64 && (
        <Image source={{ uri: post.ImagenBase64 }} style={styles.postImage} />
      )}
      {post.Imagen && !post.ImagenBase64 && (
        <Image source={{ uri: post.Imagen }} style={styles.postImage} />
      )}
      <View style={styles.postActions}>
        <View style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color="#666" />
          <Text style={styles.likeCount}>{post.Cant_MeGustas || 0}</Text>
        </View>
        <View style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.likeCount}>{post.Comentarios?.length || 0}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#000" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B0000" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#000" barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={60} color="#CCC" />
          <Text style={styles.errorText}>Usuario no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            {userProfile.avatar ? (
              <Image source={{ uri: userProfile.avatar }} style={styles.profileAvatarImage} />
            ) : (
              <Ionicons name="person" size={40} color="#8B0000" />
            )}
          </View>
          
          <Text style={styles.profileName}>{userProfile.nombre}</Text>
          <Text style={styles.profileDescription}>{userProfile.descripcion}</Text>
          <Text style={styles.profileJoinDate}>{userProfile.fechaRegistro}</Text>
          <Text style={styles.profileEmail}>{userProfile.email}</Text>
          
          {/* Botón de Seguir/Dejar de seguir */}
          {currentUserId !== userId && (
            <TouchableOpacity 
              style={[
                styles.followButton,
                isFollowing && styles.unfollowButton
              ]}
              onPress={handleFollow}
            >
              <Text style={[
                styles.followButtonText,
                isFollowing && styles.unfollowButtonText
              ]}>
                {isFollowing ? 'Dejar de seguir' : 'Seguir'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* User Posts */}
        {userPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={60} color="#CCC" />
            <Text style={styles.emptyStateText}>No hay publicaciones</Text>
            <Text style={styles.emptyStateSubtext}>
              {userProfile.nombre} no ha creado publicaciones aún
            </Text>
          </View>
        ) : (
          userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </ScrollView>

      {/* Bottom Wave */}
      <View style={styles.bottomWave} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerButton: {
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
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#8B0000',
    overflow: 'hidden',
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  profileJoinDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#8B0000',
    marginBottom: 20,
  },
  followButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
  },
  unfollowButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#8B0000',
  },
  followButtonText: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: '500',
  },
  unfollowButtonText: {
    color: '#8B0000',
  },
  postCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  postDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 20,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 5,
  },
  likeCount: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomWave: {
    height: 20,
    backgroundColor: '#8B0000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});

export default UserProfileScreen;
