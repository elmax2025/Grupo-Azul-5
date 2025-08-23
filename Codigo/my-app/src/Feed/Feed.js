
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
  Modal,
  TextInput,
  Alert,
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

// Modal para Crear Publicación
const CreatePostModal = ({ visible, onClose, onCreatePost }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleCreatePost = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const newPost = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      image: imageUrl.trim() || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
      isLiked: false,
    };

    onCreatePost(newPost);
    
    // Limpiar campos
    setTitle('');
    setDescription('');
    setImageUrl('');
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setImageUrl('');
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header del Modal */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleClose} style={styles.modalHeaderButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nueva Publicación</Text>
            <TouchableOpacity onPress={handleCreatePost} style={styles.modalHeaderButton}>
              <Text style={styles.publishButton}>Publicar</Text>
            </TouchableOpacity>
          </View>

          {/* Contenido del Modal */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Campo Título */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Título</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Escribe el título de tu publicación..."
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>

            {/* Campo Descripción */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe tu publicación..."
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            {/* Campo URL de Imagen (Opcional) */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>URL de Imagen (Opcional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://ejemplo.com/imagen.jpg"
                value={imageUrl}
                onChangeText={setImageUrl}
                keyboardType="url"
              />
              <Text style={styles.helpText}>
                Si no agregas una imagen, se usará una imagen por defecto
              </Text>
            </View>

            {/* Preview de la imagen */}
            {imageUrl.trim() && (
              <View style={styles.imagePreviewContainer}>
                <Text style={styles.inputLabel}>Vista Previa</Text>
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.imagePreview}
                  onError={() => setImageUrl('')}
                />
              </View>
            )}
          </ScrollView>

          {/* Botones de acción */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={handleCreatePost}>
              <Text style={styles.createButtonText}>Crear Publicación</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Pantalla Principal (Feed) con botón de crear
const FeedScreen = ({ onNavigateToProfile }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  const handleCreatePost = (newPost) => {
    setPosts([newPost, ...posts]); // Agregar al inicio de la lista
    Alert.alert('¡Éxito!', 'Tu publicación ha sido creada');
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

      {/* Botón Flotante para Crear Publicación */}
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={() => setShowCreateModal(true)}
      >
        <View style={styles.floatingButtonContent}>
          <Ionicons name="add" size={28} color="#FFF" />
          <Text style={styles.floatingButtonText}>Crear</Text>
        </View>
      </TouchableOpacity>

      {/* Modal para Crear Publicación */}
      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreatePost={handleCreatePost}
      />

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
    fontWeight: '5000',
  },

  activeTabText: {
    color: '#FFA500',
  },
  scrollView: {
    flex: 1,
    marginBottom: 80, // Espacio para el botón flotante
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
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#8B0000',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floatingButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF8DC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalHeaderButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  publishButton: {
    color: '#8B0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginVertical: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  imagePreviewContainer: {
    marginVertical: 15,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#8B0000',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomWave: {
  height: 40,
  backgroundColor: '#8B0000',
  borderTopLeftRadius: 5,
  borderTopRightRadius: 5,
},
});

export default FeedScreen;

