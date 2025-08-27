import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Componente de Post
const PostCard = ({ post, onLike, onTag, onComment }) => (
  <View style={styles.postCard}>
    <Text style={styles.userName}>Nombre del Usuario</Text>
    <Text style={styles.postTitle}>{post.title}</Text>
    <Text style={styles.postDescription}>{post.description}</Text>
    <Image source={{ uri: post.image }} style={styles.postImage} />
    <View style={styles.postActions}>
      <TouchableOpacity onPress={() => onLike(post.id)} style={styles.actionButton}>
        <Ionicons 
          name={post.isLiked ? "heart" : "heart-outline"} 
          size={24} 
          color={post.isLiked ? "#8B0000" : "#666"} 
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onTag(post.id)} style={styles.actionButton}>
        <Ionicons name="bookmark-outline" size={24} color="#666" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onComment(post.id)} style={styles.actionButton}>
        <Ionicons name="chatbubble-outline" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  </View>
);

// Pantalla de Perfil
const ProfileScreen = ({ onNavigateBack }) =>{
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Titulo',
      description: 'Descripcion',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
      isLiked: true,
    },
    {
      id: 2,
      title: 'Titulo',
      description: 'Descripcion',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
      isLiked: false,
    },
    {
      id: 3,
      title: 'Titulo',
      description: 'Descripcion',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
      isLiked: true,
    },
  ]);

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, isLiked: !post.isLiked } : post
    ));
  };

  const handleTag = (postId) => {
    console.log('Tag post:', postId);
  };

  const handleComment = (postId) => {
    console.log('Comment on post:', postId);
  };

  const handleDelete = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={40} color="#8B0000" />
          </View>
          
          <Text style={styles.profileName}>Nombre</Text>
          <Text style={styles.profileDescription}>Descripcion</Text>
          <Text style={styles.profileJoinDate}>Se unio en enero del 2020</Text>
          
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
          
          <View style={styles.followContainer}>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Seguidos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Seguidores</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Posts */}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onTag={handleTag}
            onComment={handleComment}
          />
        ))}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.floatingButton}>
        <View style={styles.floatingButtonContent}>
          <Ionicons name="add" size={16} color="#FFF" />
          <Text style={styles.floatingButtonText}>Crear</Text>
        </View>
      </TouchableOpacity>

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
  headerRight: {
    flexDirection: 'row',
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#8B0000',
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
  },
  profileJoinDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 20,
  },
  editButtonText: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: '500',
  },
  followContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  followButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#FFA500',
    fontSize: 14,
    fontWeight: '500',
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
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  postContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
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
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20,
    marginTop: 10,
  },
  actionButton: {
    padding: 5,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#8B0000',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  floatingButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomWave: {
    height: 20,
    backgroundColor: '#8B0000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});

export default ProfileScreen;
