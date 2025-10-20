import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

const LikedPosts = ({ navigation }) => {
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLikedPosts = () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const postsQuery = query(
          collection(db, 'Spaghetti/Publicaciones/Publicaciones'),
          where('likedBy', 'array-contains', user.uid)
        );

        const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
          const postsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setLikedPosts(postsData);
          setLoading(false);
        }, (error) => {
          console.error('Error cargando posts con like:', error);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error en loadLikedPosts:', error);
        setLoading(false);
      }
    };

    const unsubscribe = loadLikedPosts();
    return () => unsubscribe();
  }, []);

  const PostCard = ({ post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.userName}>{post.Nombre_Usuario || 'Usuario'}</Text>
        <View style={styles.likeIndicator}>
          <Ionicons name="heart" size={16} color="#8B0000" />
          <Text style={styles.likeText}>Te gustó esta publicación</Text>
        </View>
      </View>
      
      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{post.Titulo}</Text>
        <Text style={styles.postDescription}>{post.Descripcion}</Text>
      </View>
      
      {post.ImagenBase64 && (
        <Image source={{ uri: post.ImagenBase64 }} style={styles.postImage} />
      )}
      
      <View style={styles.postStats}>
        <Text style={styles.likesCount}>{post.Cant_MeGustas || 0} me gusta</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B0000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publicaciones que Me Gustan</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#8B0000" />
            <Text style={styles.emptyStateText}>Cargando publicaciones...</Text>
          </View>
        ) : likedPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={60} color="#CCC" />
            <Text style={styles.emptyStateText}>No tienes publicaciones con like</Text>
            <Text style={styles.emptyStateSubtext}>
              Las publicaciones que des like aparecerán aquí
            </Text>
          </View>
        ) : (
          likedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
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
    padding: 15,
  },
  postCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  likeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  likeText: {
    fontSize: 12,
    color: '#8B0000',
    marginLeft: 4,
  },
  postContent: {
    marginBottom: 10,
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
    lineHeight: 20,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
  postStats: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  likesCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
});

export default LikedPosts;
