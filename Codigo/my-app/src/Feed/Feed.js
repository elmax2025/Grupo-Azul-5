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
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

// Componente de Post
const PostCard = ({ post, onLike, onSave, onComment }) => (
  <View style={styles.postCard}>
    <View style={styles.postHeader}>
      <Text style={styles.userName}>{post.Nombre_Usuario || 'Usuario'}</Text>
    </View>
    <View style={styles.postContent}>
      <Text style={styles.postTitle}>{post.Titulo}</Text>
      <Text style={styles.postDescription}>{post.Descripcion}</Text>
    </View>
    {/* Mostrar imagen Base64 o URL normal */}
    {post.ImagenBase64 && (
      <Image 
        source={{ uri: post.ImagenBase64 }} 
        style={styles.postImage} 
      />
    )}
    {post.Imagen && !post.ImagenBase64 && (
      <Image source={{ uri: post.Imagen }} style={styles.postImage} />
    )}
    <View style={styles.postActions}>
      <TouchableOpacity onPress={() => onLike(post.id)} style={styles.actionButton}>
        <Ionicons 
          name={post.isLiked ? "heart" : "heart-outline"} 
          size={24} 
          color={post.isLiked ? "#8B0000" : "#666"} 
        />
        <Text style={styles.likeCount}>{post.Cant_MeGustas || 0}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onSave(post.id)} style={styles.actionButton}>
        <Ionicons 
          name={post.isSaved ? "bookmark" : "bookmark-outline"} 
          size={24} 
          color={post.isSaved ? "#8B0000" : "#666"} 
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onComment(post.id)} style={styles.actionButton}>
        <Ionicons name="chatbubble-outline" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  </View>
);

// Modal para Crear Publicación
const CreatePostModal = ({ visible, onClose, onCreatePost, userName }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Solicitar permisos al abrir el modal
  useEffect(() => {
    if (visible) {
      requestPermissions();
    }
  }, [visible]);

  const requestPermissions = async () => {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para tomar fotos');
      }
      if (libraryStatus !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a la galería para seleccionar imágenes');
      }
    } catch (error) {
      console.error('Error solicitando permisos:', error);
    }
  };

  // CONVERTIR IMAGEN A BASE64 - SIN FIREBASE STORAGE
  const uploadImage = async (uri) => {
    try {
      console.log('📸 Convirtiendo imagen a Base64...');
      
      // Convertir imagen a Base64
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64data = reader.result;
          console.log('✅ Imagen convertida a Base64, tamaño:', base64data.length);
          resolve(base64data);
        };
        reader.onerror = () => {
          reject(new Error('Error leyendo la imagen'));
        };
        reader.readAsDataURL(blob);
      });
      
    } catch (error) {
      console.error('❌ Error convirtiendo imagen:', error);
      Alert.alert('Error', 'No se pudo procesar la imagen');
      throw error;
    }
  };

  // Abrir galería
  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        maxWidth: 800,
        maxHeight: 800,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        
        // Validar tamaño (Base64 puede ser grande)
        if (selectedAsset.fileSize > 2 * 1024 * 1024) {
          Alert.alert('Error', 'La imagen es demasiado grande. Elige una más pequeña (menos de 2MB).');
          return;
        }
        
        setSelectedImage(selectedAsset.uri);
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  // Tomar foto con la cámara
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        maxWidth: 800,
        maxHeight: 800,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error tomando foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  // Eliminar imagen seleccionada
  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleCreatePost = async () => {
    if (!titulo.trim() || !descripcion.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setUploading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión para crear publicaciones');
        return;
      }

      let imageBase64 = null;
      
      // Convertir imagen a Base64 si hay una seleccionada
      if (selectedImage) {
        console.log('🔄 Convirtiendo imagen a Base64...');
        imageBase64 = await uploadImage(selectedImage);
        console.log('✅ Imagen convertida exitosamente');
      }

      await onCreatePost({
        Titulo: titulo.trim(),
        Descripcion: descripcion.trim(),
        Imagen: imageBase64, // Ahora es Base64
        Nombre_Usuario: userName
      });
      
      // Limpiar campos
      setTitulo('');
      setDescripcion('');
      setSelectedImage(null);
      setUploading(false);
      onClose();
    } catch (error) {
      console.error('Error en handleCreatePost:', error);
      setUploading(false);
      Alert.alert('Error', 'No se pudo crear la publicación');
    }
  };

  const handleClose = () => {
    setTitulo('');
    setDescripcion('');
    setSelectedImage(null);
    setUploading(false);
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
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleClose} style={styles.modalHeaderButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nueva Publicación</Text>
            <TouchableOpacity 
              onPress={handleCreatePost} 
              style={styles.modalHeaderButton}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#8B0000" />
              ) : (
                <Text style={styles.publishButton}>Publicar</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Información del usuario */}
            <View style={styles.userInfoContainer}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={20} color="#8B0000" />
              </View>
              <Text style={styles.userNameText}>Publicando como: {userName}</Text>
            </View>

            {/* Selección de imagen */}
            <View style={styles.imageSelectionContainer}>
              <Text style={styles.inputLabel}>Imagen (Opcional)</Text>
              
              {selectedImage ? (
                <View style={styles.selectedImageContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                    <Ionicons name="close-circle" size={24} color="#8B0000" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageButtonsContainer}>
                  <TouchableOpacity style={styles.imageButton} onPress={pickImageFromGallery}>
                    <Ionicons name="images-outline" size={24} color="#8B0000" />
                    <Text style={styles.imageButtonText}>Galería</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                    <Ionicons name="camera-outline" size={24} color="#8B0000" />
                    <Text style={styles.imageButtonText}>Cámara</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Campo Título */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Título *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Escribe el título de tu publicación..."
                value={titulo}
                onChangeText={setTitulo}
                maxLength={100}
                editable={!uploading}
              />
              <Text style={styles.helpText}>{titulo.length}/100 caracteres</Text>
            </View>

            {/* Campo Descripción */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Descripción *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe tu publicación..."
                value={descripcion}
                onChangeText={setDescripcion}
                multiline={true}
                numberOfLines={4}
                maxLength={500}
                editable={!uploading}
              />
              <Text style={styles.helpText}>{descripcion.length}/500 caracteres</Text>
            </View>

            {/* Indicador de carga */}
            {uploading && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color="#8B0000" />
                <Text style={styles.uploadingText}>
                  {selectedImage ? 'Procesando imagen...' : 'Creando publicación...'}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Botones de acción */}
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.cancelButton, uploading && styles.disabledButton]} 
              onPress={handleClose}
              disabled={uploading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.createButton, uploading && styles.disabledButton]} 
              onPress={handleCreatePost}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#FFA500" />
              ) : (
                <Text style={styles.createButtonText}>Crear Publicación</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Pantalla Principal (Feed)
const FeedScreen = ({ navigation }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('paraTi');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Usuario');

  // Cargar nombre del usuario actual
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setUserName('Usuario');
          return;
        }

        const userDocRef = doc(db, 'Spaghetti', 'Usuario', 'Usuario', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.nombre || user.email || 'Usuario');
        } else {
          setUserName(user.email || 'Usuario');
        }
      } catch (error) {
        console.error('Error cargando nombre de usuario:', error);
        setUserName('Usuario');
      }
    };

    loadUserName();
  }, []);

  // Cargar publicaciones desde Firebase
  useEffect(() => {
    const loadPosts = () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        let postsQuery;
        
        if (activeTab === 'paraTi') {
          postsQuery = query(
            collection(db, 'Spaghetti/Publicaciones/Publicaciones'),
            orderBy('Fecha_publicacion', 'desc')
          );
        } else {
          postsQuery = query(
            collection(db, 'Spaghetti/Publicaciones/Publicaciones'),
            orderBy('Fecha_publicacion', 'desc')
          );
        }

        const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
          const postsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setPosts(postsData);
          setLoading(false);
        }, (error) => {
          console.error('Error cargando posts:', error);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error en loadPosts:', error);
        setLoading(false);
      }
    };

    const unsubscribe = loadPosts();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeTab]);

  // Crear nueva publicación CON IMAGEN BASE64
  const handleCreatePost = async (postData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('📝 Creando post con imagen Base64...');

      const postDataToSave = {
        Titulo: postData.Titulo,
        Descripcion: postData.Descripcion,
        Cant_MeGustas: 0,
        Fecha_publicacion: serverTimestamp(),
        userId: user.uid,
        Nombre_Usuario: postData.Nombre_Usuario,
        isLiked: false,
        isSaved: false
      };

      // Si hay imagen Base64, guardarla en Firestore
      if (postData.Imagen) {
        postDataToSave.ImagenBase64 = postData.Imagen;
        console.log('🖼️ Imagen guardada como Base64 en Firestore');
      }

      await addDoc(collection(db, 'Spaghetti/Publicaciones/Publicaciones'), postDataToSave);

      console.log('✅ Post creado exitosamente con imagen Base64');
      Alert.alert('¡Éxito!', 'Tu publicación con imagen ha sido creada');
    } catch (error) {
      console.error('❌ Error creando post:', error);
      Alert.alert('Error', 'No se pudo crear la publicación');
      throw error;
    }
  };

  const handleLike = async (postId) => {
    try {
      const postRef = doc(db, 'Spaghetti/Publicaciones/Publicaciones', postId);
      const post = posts.find(p => p.id === postId);
      
      if (post) {
        const newLikeCount = post.isLiked ? 
          (post.Cant_MeGustas || 0) - 1 : 
          (post.Cant_MeGustas || 0) + 1;
        
        await updateDoc(postRef, {
          Cant_MeGustas: newLikeCount,
          isLiked: !post.isLiked
        });
      }
    } catch (error) {
      console.error('Error actualizando like:', error);
    }
  };

  const handleSave = (postId) => {
    console.log('Guardar post:', postId);
  };

  const handleComment = (postId) => {
    console.log('Comment on post:', postId);
  };

  const handleNavigateToProfile = () => {
    navigation.navigate('Perfil');
  };

  const handleNavigateToSettings = () => {
    navigation.navigate('UserConfig');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleNavigateToProfile} style={styles.headerButton}>
          <Ionicons name="person-circle-outline" size={32} color="#8B0000" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerLogo}>$</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleNavigateToSettings}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#8B0000" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'paraTi' && styles.activeTab
          ]}
          onPress={() => handleTabChange('paraTi')}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'paraTi' && styles.activeTabText
          ]}>
            Para ti
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'siguiendo' && styles.activeTab
          ]}
          onPress={() => handleTabChange('siguiendo')}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'siguiendo' && styles.activeTabText
          ]}>
            Siguiendo
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="refresh-outline" size={60} color="#CCC" />
            <Text style={styles.emptyStateText}>Cargando publicaciones...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name={activeTab === 'paraTi' ? "compass-outline" : "people-outline"} 
              size={60} 
              color="#CCC" 
            />
            <Text style={styles.emptyStateText}>
              {activeTab === 'paraTi' 
                ? 'No hay publicaciones aún' 
                : 'No hay publicaciones de usuarios que sigues'
              }
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {activeTab === 'paraTi'
                ? 'Sé el primero en crear una publicación'
                : 'Sigue a más usuarios para ver sus publicaciones aquí'
              }
            </Text>
            <TouchableOpacity 
              style={styles.createFirstButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.createFirstButtonText}>
                Crear primera publicación
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onSave={handleSave}
              onComment={handleComment}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={() => setShowCreateModal(true)}
      >
        <View style={styles.floatingButtonContent}>
          <Ionicons name="add" size={16} color="#FFF" />
          <Text style={styles.floatingButtonText}>Crear</Text>
        </View>
      </TouchableOpacity>

      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreatePost={handleCreatePost}
        userName={userName}
      />

      <View style={styles.bottomWave} />
    </SafeAreaView>
  );
};

// Los estilos permanecen IGUALES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: 'center',
    backgroundColor: '#000000ff',
    paddingHorizontal: 10,
    paddingVertical: 1,
  },
  headerButton: {
    padding: 10,
    paddingVertical: 35,
  },
  headerCenter: {
    backgroundColor: '#FFA500',
    right: 4,
    width: 35,
    height: 35,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: "center",
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
    paddingBottom: 10,
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
    marginBottom: 80,
  },
  postCard: {
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
  postHeader: {
    padding: 15,
    paddingBottom: 0,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 8,
  },
  postContent: {
    paddingHorizontal: 15,
    paddingBottom: 10,
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
    height: 250,
    marginVertical: 10,
  },
  postActions: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 20,
    alignItems: 'center',
  },
  actionButton: {
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  likeCount: {
    fontSize: 14,
    color: '#666',
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
    color: '#ffffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
  createFirstButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  createFirstButtonText: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageSelectionContainer: {
    marginVertical: 15,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#8B0000',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  imageButtonText: {
    color: '#8B0000',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedImageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 2,
  },
  uploadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  uploadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userNameText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
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
    textAlign: 'right',
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
    height: 50,
    backgroundColor: '#8B0000',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
});

export default FeedScreen;
