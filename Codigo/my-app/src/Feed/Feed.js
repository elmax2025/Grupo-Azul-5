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
const PostCard = ({ post, onLike, onTag, onComment, onDelete }) => (
  <View style={styles.postCard}>
    <Image source={{ uri: post.image }} style={styles.postImage} />
    <View style={styles.postContent}>
      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postDescription}>{post.description}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity onPress={() => onLike(post.id)} style={styles.actionButton}>
          <Ionicons 
            name={post.isLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={post.isLiked ? "#8B0000" : "#666"} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onTag(post.id)} style={styles.actionButton}>
          <Ionicons name="pricetag-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onComment(post.id)} style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(post.id)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// Pantalla Principal (Feed)
const FeedScreen = ({ onNavigateToProfile }) => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Titulo',
      description: 'Descripcion',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
      isLiked: false,
    },
    {
      id: 2,
      title: 'Titulo',
      description: 'Descripcion',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop',
      isLiked: true,
    },
    {
      id: 3,
      title: 'Titulo',
      description: 'Descripcion',
      image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=200&fit=crop',
      isLiked: false,
    },
    {
      id: 4,
      title: 'Titulo',
      description: 'Descripcion',
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=200&fit=crop',
      isLiked: false,
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
        <TouchableOpacity onPress={onNavigateToProfile} style={styles.headerButton}>
          <Ionicons name="person-circle-outline" size={32} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerLogo}>$</Text>
        </View>
        
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Para ti</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Siguiendo</Text>
        </TouchableOpacity>
      </View>

      {/* Posts */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onTag={handleTag}
            onComment={handleComment}
            onDelete={handleDelete}
          />
        ))}
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
  headerCenter: {
    backgroundColor: '#FFA500',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#8B0000',
  },
  tabText: {
    fontSize: 16,
    color: '#8B0000',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFA500',
  },
  scrollView: {
    flex: 1,
  },
  postCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postImage: {
    width: 120,
    height: 120,
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
    justifyContent: 'space-around',
  },
  actionButton: {
    padding: 5,
  },
  bottomWave: {
    height: 20,
    backgroundColor: '#8B0000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});

export default FeedScreen;