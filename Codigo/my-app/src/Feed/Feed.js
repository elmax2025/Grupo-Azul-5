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
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Vibration,
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
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { useAccessibility } from '../context/AccesibilityContext';

// --- COMPONENTE: CommentModal ---
const CommentModal = ({ visible, onClose, postId, postTitle, userName }) => {
  const { settings, fontSize } = useAccessibility();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const currentUserId = auth.currentUser?.uid;

  // 1. Cargar comentarios
  useEffect(() => {
    if (!visible || !postId) return;

    const postRef = doc(db, 'Spaghetti/Publicaciones/Publicaciones', postId);

    const unsubscribe = onSnapshot(postRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const postData = docSnapshot.data();
        const loadedComments = postData.Comentarios || [];
        
        const formattedComments = loadedComments.map(comment => ({
          ...comment,
        })).reverse();

        setComments(formattedComments);
        setLoadingComments(false);
      } else {
        console.log("No existe el post para cargar comentarios.");
        setLoadingComments(false);
      }
    }, (error) => {
      console.error("Error al cargar comentarios:", error);
      setLoadingComments(false);
    });

    return unsubscribe;
  }, [visible, postId]);

  // 2. Enviar un nuevo comentario
  const handleSendComment = async () => {
    if (!commentText.trim() || !currentUserId) return;

    // Feedback háptico
    if (settings.hapticFeedback) {
      Vibration.vibrate(50);
    }

    setIsSending(true);
    const newComment = {
      userId: currentUserId,
      Nombre_Usuario: userName,
      Texto: commentText.trim(),
      Fecha: new Date().toISOString(),
    };

    try {
      const postRef = doc(db, 'Spaghetti/Publicaciones/Publicaciones', postId);

      await updateDoc(postRef, {
        Comentarios: arrayUnion(newComment),
      });

      setCommentText('');
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      Alert.alert('Error', 'No se pudo enviar el comentario. Inténtalo de nuevo.');
    } finally {
      setIsSending(false);
    }
  };
  
  // Componente individual para renderizar un comentario
  const renderComment = ({ item }) => (
    <View style={commentStyles.commentItem}>
      <Text style={[
        commentStyles.commentUser,
        settings.largeText && { fontSize: fontSize + 2 },
        settings.boldText && { fontWeight: 'bold' }
      ]}>
        {item.Nombre_Usuario || 'Usuario Desconocido'}
      </Text>
      <Text style={[
        commentStyles.commentText,
        settings.largeText && { fontSize: fontSize },
        settings.boldText && { fontWeight: '500' }
      ]}>
        {item.Texto}
      </Text>
    </View>
  );

  const handleClose = () => {
    setCommentText('');
    setComments([]);
    setLoadingComments(true);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[
          commentStyles.modalOverlay,
          settings.darkMode && styles.darkContainer,
          settings.highContrast && styles.highContrastContainer
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[
          commentStyles.modalContainer,
          settings.darkMode && styles.darkCard,
          settings.highContrast && styles.highContrastCard
        ]}>
          <View style={commentStyles.modalHeader}>
            <TouchableOpacity onPress={handleClose} style={commentStyles.modalHeaderButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={[
              commentStyles.modalTitle,
              settings.largeText && { fontSize: fontSize + 4 },
              settings.boldText && { fontWeight: 'bold' }
            ]}>
              Comentarios
            </Text>
            <View style={{ width: 44 }} />
          </View>

          {loadingComments ? (
            <ActivityIndicator size="large" color="#8B0000" style={{ marginVertical: 20 }} />
          ) : (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item, index) => index.toString()}
              style={commentStyles.commentsList}
              ListEmptyComponent={() => (
                <View style={commentStyles.emptyState}>
                  <Ionicons name="chatbubble-outline" size={50} color="#CCC" />
                  <Text style={[
                    commentStyles.emptyStateText,
                    settings.largeText && { fontSize: fontSize },
                    settings.boldText && { fontWeight: '500' }
                  ]}>
                    Sé el primero en comentar esta publicación.
                  </Text>
                </View>
              )}
            />
          )}

          {/* Área de Input de Comentario */}
          <View style={commentStyles.commentInputContainer}>
            <TextInput
              style={[
                commentStyles.commentInput,
                settings.largeText && { fontSize: fontSize },
                settings.boldText && { fontWeight: '500' }
              ]}
              placeholder="Añade un comentario..."
              value={commentText}
              onChangeText={setCommentText}
              multiline={true}
              maxHeight={100}
              editable={!isSending}
              placeholderTextColor={settings.darkMode ? "#999" : "#666"}
            />
            <TouchableOpacity 
              style={[commentStyles.sendButton, isSending || commentText.trim().length === 0 ? commentStyles.disabledSendButton : {}]}
              onPress={handleSendComment}
              disabled={isSending || commentText.trim().length === 0}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFA500" />
              ) : (
                <Ionicons name="send" size={24} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Componente de Post - MODIFICADO PARA PERMITIR NAVEGAR AL PERFIL DEL USUARIO
const PostCard = ({ post, onLike, onSave, onComment, onUserPress }) => {
  const { settings, fontSize } = useAccessibility();

  const handleLikePress = () => {
    if (settings.hapticFeedback) {
      Vibration.vibrate(50);
    }
    onLike(post.id);
  };

  const handleCommentPress = () => {
    if (settings.hapticFeedback) {
      Vibration.vibrate(50);
    }
    onComment(post.id, post.Titulo);
  };

  const handleUserPress = () => {
    if (settings.hapticFeedback) {
      Vibration.vibrate(50);
    }
    onUserPress(post.userId, post.Nombre_Usuario);
  };

  return (
    <View style={[
      styles.postCard,
      settings.darkMode && styles.darkCard,
      settings.highContrast && styles.highContrastCard
    ]}>
      <View style={styles.postHeader}>
        <TouchableOpacity 
          style={styles.userNameContainer}
          onPress={handleUserPress}
        >
          <Text style={[
            styles.userName,
            settings.largeText && { fontSize: fontSize + 2 },
            settings.boldText && { fontWeight: 'bold' }
          ]}>
            {post.Nombre_Usuario || 'Usuario'}
          </Text>
        </TouchableOpacity>
        {post.categoria && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{post.categoria}</Text>
          </View>
        )}
      </View>
      <View style={styles.postContent}>
        <Text style={[
          styles.postTitle,
          settings.largeText && { fontSize: fontSize + 4 },
          settings.boldText && { fontWeight: 'bold' }
        ]}>
          {post.Titulo}
        </Text>
        <Text style={[
          styles.postDescription,
          settings.largeText && { fontSize: fontSize },
          settings.boldText && { fontWeight: '500' }
        ]}>
          {post.Descripcion}
        </Text>
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
        <TouchableOpacity onPress={handleLikePress} style={styles.actionButton}>
          <Ionicons 
            name={post.userLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={post.userLiked ? "#8B0000" : "#666"} 
          />
          <Text style={[
            styles.likeCount,
            settings.largeText && { fontSize: fontSize },
            settings.boldText && { fontWeight: '500' }
          ]}>
            {post.Cant_MeGustas || 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSave} style={styles.actionButton}>
          <Ionicons 
            name={post.isSaved ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={post.isSaved ? "#8B0000" : "#666"} 
          />
        </TouchableOpacity>
        {/* Botón de Comentarios */}
        <TouchableOpacity onPress={handleCommentPress} style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#666" />
          <Text style={[
            styles.likeCount,
            settings.largeText && { fontSize: fontSize },
            settings.boldText && { fontWeight: '500' }
          ]}>
            {post.Comentarios?.length || 0}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- NUEVO COMPONENTE: Modal de Selección de Categorías ---
const CategoriesSelectorModal = ({ visible, onClose, onCategoriesSelected, selectedCategories }) => {
  const { settings, fontSize } = useAccessibility();
  const [tempSelectedCategories, setTempSelectedCategories] = useState(selectedCategories || []);

  // Lista de categorías disponibles (la misma que en Perfil.js)
  const availableCategories = [
    { id: 'tecnologia', name: 'Tecnología', icon: 'phone-portrait' },
    { id: 'deportes', name: 'Deportes', icon: 'basketball' },
    { id: 'musica', name: 'Música', icon: 'musical-notes' },
    { id: 'arte', name: 'Arte', icon: 'color-palette' },
    { id: 'ciencia', name: 'Ciencia', icon: 'flask' },
    { id: 'viajes', name: 'Viajes', icon: 'airplane' },
    { id: 'comida', name: 'Comida', icon: 'restaurant' },
    { id: 'moda', name: 'Moda', icon: 'shirt' },
    { id: 'juegos', name: 'Juegos', icon: 'game-controller' },
    { id: 'educacion', name: 'Educación', icon: 'school' },
    { id: 'negocios', name: 'Negocios', icon: 'briefcase' },
    { id: 'salud', name: 'Salud', icon: 'fitness' },
    { id: 'animales', name: 'Animales', icon: 'paw' },
    { id: 'naturaleza', name: 'Naturaleza', icon: 'leaf' },
    { id: 'deportes_extremos', name: 'Deportes Extremos', icon: 'rocket' },
    { id: 'cocina', name: 'Cocina', icon: 'cafe' },
    { id: 'fotografia', name: 'Fotografía', icon: 'camera' },
    { id: 'cine', name: 'Cine', icon: 'film' },
    { id: 'libros', name: 'Libros', icon: 'book' },
    { id: 'automoviles', name: 'Automóviles', icon: 'car' }
  ];

  const toggleCategory = (categoryId) => {
    if (settings.hapticFeedback) {
      Vibration.vibrate(50);
    }
    
    setTempSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        // Permitir solo una categoría por publicación (puedes cambiar esto si quieres múltiples)
        return [categoryId];
      }
    });
  };

  const handleSave = () => {
    if (settings.hapticFeedback) {
      Vibration.vibrate(50);
    }
    onCategoriesSelected(tempSelectedCategories);
    onClose();
  };

  const handleClose = () => {
    setTempSelectedCategories(selectedCategories || []);
    onClose();
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        categoriesSelectorStyles.categoryItem,
        tempSelectedCategories.includes(item.id) && categoriesSelectorStyles.categoryItemSelected
      ]}
      onPress={() => toggleCategory(item.id)}
    >
      <View style={categoriesSelectorStyles.categoryIcon}>
        <Ionicons 
          name={item.icon} 
          size={20} 
          color={tempSelectedCategories.includes(item.id) ? "#FFA500" : "#666"} 
        />
      </View>
      <Text style={[
        categoriesSelectorStyles.categoryName,
        tempSelectedCategories.includes(item.id) && categoriesSelectorStyles.categoryNameSelected,
        settings.largeText && { fontSize: fontSize },
        settings.boldText && { fontWeight: '500' }
      ]}>
        {item.name}
      </Text>
      {tempSelectedCategories.includes(item.id) && (
        <Ionicons name="checkmark-circle" size={20} color="#FFA500" />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={[
        categoriesSelectorStyles.modalOverlay,
        settings.darkMode && styles.darkContainer,
        settings.highContrast && styles.highContrastContainer
      ]}>
        <View style={[
          categoriesSelectorStyles.modalContainer,
          settings.darkMode && styles.darkCard,
          settings.highContrast && styles.highContrastCard
        ]}>
          <View style={categoriesSelectorStyles.modalHeader}>
            <TouchableOpacity onPress={handleClose} style={categoriesSelectorStyles.modalHeaderButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={[
              categoriesSelectorStyles.modalTitle,
              settings.largeText && { fontSize: fontSize + 4 },
              settings.boldText && { fontWeight: 'bold' }
            ]}>
              Seleccionar Categoría
            </Text>
            <TouchableOpacity onPress={handleSave} style={categoriesSelectorStyles.modalHeaderButton}>
              <Text style={categoriesSelectorStyles.saveButton}>Listo</Text>
            </TouchableOpacity>
          </View>

          <View style={categoriesSelectorStyles.modalContent}>
            <Text style={[
              categoriesSelectorStyles.description,
              settings.largeText && { fontSize: fontSize },
              settings.boldText && { fontWeight: '500' }
            ]}>
              Selecciona la categoría que mejor describe tu publicación.
            </Text>
            
            <Text style={[
              categoriesSelectorStyles.selectedCount,
              settings.largeText && { fontSize: fontSize },
              settings.boldText && { fontWeight: 'bold' }
            ]}>
              {tempSelectedCategories.length} de 1 categoría seleccionada
            </Text>

            <FlatList
              data={availableCategories}
              renderItem={renderCategoryItem}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={categoriesSelectorStyles.categoriesGrid}
              showsVerticalScrollIndicator={false}
              style={categoriesSelectorStyles.categoriesList}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Modal para Crear Publicación - MODIFICADO PARA INCLUIR CATEGORÍAS
const CreatePostModal = ({ visible, onClose, onCreatePost, userName }) => {
  const { settings, fontSize } = useAccessibility();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);

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

  const uploadImage = async (uri) => {
    try {
      console.log('📸 Convirtiendo imagen a Base64...');
      
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

  const removeImage = () => {
    setSelectedImage(null);
  };

  // NUEVA FUNCIÓN: Manejar selección de categorías
  const handleCategoriesSelected = (categories) => {
    setSelectedCategories(categories);
  };

  // NUEVA FUNCIÓN: Obtener nombre de la categoría seleccionada
  const getSelectedCategoryName = () => {
    if (selectedCategories.length === 0) return 'Seleccionar categoría';
    
    const availableCategories = [
      { id: 'tecnologia', name: 'Tecnología' },
      { id: 'deportes', name: 'Deportes' },
      { id: 'musica', name: 'Música' },
      { id: 'arte', name: 'Arte' },
      { id: 'ciencia', name: 'Ciencia' },
      { id: 'viajes', name: 'Viajes' },
      { id: 'comida', name: 'Comida' },
      { id: 'moda', name: 'Moda' },
      { id: 'juegos', name: 'Juegos' },
      { id: 'educacion', name: 'Educación' },
      { id: 'negocios', name: 'Negocios' },
      { id: 'salud', name: 'Salud' },
      { id: 'animales', name: 'Animales' },
      { id: 'naturaleza', name: 'Naturaleza' },
      { id: 'deportes_extremos', name: 'Deportes Extremos' },
      { id: 'cocina', name: 'Cocina' },
      { id: 'fotografia', name: 'Fotografía' },
      { id: 'cine', name: 'Cine' },
      { id: 'libros', name: 'Libros' },
      { id: 'automoviles', name: 'Automóviles' }
    ];

    const selectedCategory = availableCategories.find(cat => cat.id === selectedCategories[0]);
    return selectedCategory ? selectedCategory.name : 'Seleccionar categoría';
  };

  const handleCreatePost = async () => {
    if (!titulo.trim() || !descripcion.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Feedback háptico
    if (settings.hapticFeedback) {
      Vibration.vibrate(50);
    }

    try {
      setUploading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión para crear publicaciones');
        return;
      }

      let imageBase64 = null;
      
      if (selectedImage) {
        console.log('🔄 Convirtiendo imagen a Base64...');
        imageBase64 = await uploadImage(selectedImage);
        console.log('✅ Imagen convertida exitosamente');
      }

      await onCreatePost({
        Titulo: titulo.trim(),
        Descripcion: descripcion.trim(),
        Imagen: imageBase64, 
        Nombre_Usuario: userName,
        categoria: selectedCategories.length > 0 ? selectedCategories[0] : null // NUEVO: Incluir categoría
      });
      
      setTitulo('');
      setDescripcion('');
      setSelectedImage(null);
      setSelectedCategories([]);
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
    setSelectedCategories([]);
    setUploading(false);
    onClose();
  };
  
  // Render del modal de publicación
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={[
        styles.modalOverlay,
        settings.darkMode && styles.darkContainer,
        settings.highContrast && styles.highContrastContainer
      ]}>
        <View style={[
          styles.modalContainer,
          settings.darkMode && styles.darkCard,
          settings.highContrast && styles.highContrastCard
        ]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleClose} style={styles.modalHeaderButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={[
              styles.modalTitle,
              settings.largeText && { fontSize: fontSize + 4 },
              settings.boldText && { fontWeight: 'bold' }
            ]}>
              Nueva Publicación
            </Text>
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
              <Text style={[
                styles.userNameText,
                settings.largeText && { fontSize: fontSize },
                settings.boldText && { fontWeight: '500' }
              ]}>
                Publicando como: {userName}
              </Text>
            </View>

            {/* NUEVO: Selector de Categorías */}
            <View style={styles.inputContainer}>
              <Text style={[
                styles.inputLabel,
                settings.largeText && { fontSize: fontSize + 2 },
                settings.boldText && { fontWeight: 'bold' }
              ]}>
                Categoría *
              </Text>
              <TouchableOpacity 
                style={styles.categorySelectorButton}
                onPress={() => setShowCategoriesModal(true)}
              >
                <Text style={[
                  styles.categorySelectorText,
                  selectedCategories.length > 0 && styles.categorySelectedText,
                  settings.largeText && { fontSize: fontSize },
                  settings.boldText && { fontWeight: '500' }
                ]}>
                  {getSelectedCategoryName()}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              <Text style={[
                styles.helpText,
                settings.largeText && { fontSize: fontSize - 2 }
              ]}>
                Selecciona la categoría que mejor describe tu publicación
              </Text>
            </View>

            {/* Selección de imagen */}
            <View style={styles.imageSelectionContainer}>
              <Text style={[
                styles.inputLabel,
                settings.largeText && { fontSize: fontSize + 2 },
                settings.boldText && { fontWeight: 'bold' }
              ]}>
                Imagen (Opcional)
              </Text>
              
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
                    <Text style={[
                      styles.imageButtonText,
                      settings.largeText && { fontSize: fontSize },
                      settings.boldText && { fontWeight: '500' }
                    ]}>
                      Galería
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                    <Ionicons name="camera-outline" size={24} color="#8B0000" />
                    <Text style={[
                      styles.imageButtonText,
                      settings.largeText && { fontSize: fontSize },
                      settings.boldText && { fontWeight: '500' }
                    ]}>
                      Cámara
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Campo Título */}
            <View style={styles.inputContainer}>
              <Text style={[
                styles.inputLabel,
                settings.largeText && { fontSize: fontSize + 2 },
                settings.boldText && { fontWeight: 'bold' }
              ]}>
                Título *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  settings.largeText && { fontSize: fontSize },
                  settings.boldText && { fontWeight: '500' }
                ]}
                placeholder="Escribe el título de tu publicación..."
                value={titulo}
                onChangeText={setTitulo}
                maxLength={100}
                editable={!uploading}
                placeholderTextColor={settings.darkMode ? "#999" : "#666"}
              />
              <Text style={[
                styles.helpText,
                settings.largeText && { fontSize: fontSize - 2 }
              ]}>
                {titulo.length}/100 caracteres
              </Text>
            </View>

            {/* Campo Descripción */}
            <View style={styles.inputContainer}>
              <Text style={[
                styles.inputLabel,
                settings.largeText && { fontSize: fontSize + 2 },
                settings.boldText && { fontWeight: 'bold' }
              ]}>
                Descripción *
              </Text>
              <TextInput
                style={[
                  styles.textInput, 
                  styles.textArea,
                  settings.largeText && { fontSize: fontSize },
                  settings.boldText && { fontWeight: '500' }
                ]}
                placeholder="Describe tu publicación..."
                value={descripcion}
                onChangeText={setDescripcion}
                multiline={true}
                numberOfLines={4}
                maxLength={500}
                editable={!uploading}
                placeholderTextColor={settings.darkMode ? "#999" : "#666"}
              />
              <Text style={[
                styles.helpText,
                settings.largeText && { fontSize: fontSize - 2 }
              ]}>
                {descripcion.length}/500 caracteres
              </Text>
            </View>

            {/* Indicador de carga */}
            {uploading && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color="#8B0000" />
                <Text style={[
                  styles.uploadingText,
                  settings.largeText && { fontSize: fontSize },
                  settings.boldText && { fontWeight: '500' }
                ]}>
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
              <Text style={[
                styles.cancelButtonText,
                settings.largeText && { fontSize: fontSize },
                settings.boldText && { fontWeight: '500' }
              ]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.createButton, uploading && styles.disabledButton]} 
              onPress={handleCreatePost}
              disabled={uploading || selectedCategories.length === 0}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#FFA500" />
              ) : (
                <Text style={[
                  styles.createButtonText,
                  settings.largeText && { fontSize: fontSize },
                  settings.boldText && { fontWeight: 'bold' }
                ]}>
                  Crear Publicación
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* NUEVO: Modal de selección de categorías */}
      <CategoriesSelectorModal
        visible={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        onCategoriesSelected={handleCategoriesSelected}
        selectedCategories={selectedCategories}
      />
    </Modal>
  );
};

// Pantalla Principal (Feed) - MODIFICADA PARA TIEMPO REAL
const FeedScreen = ({ navigation }) => {
  const { settings, fontSize } = useAccessibility();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedPostTitle, setSelectedPostTitle] = useState('');
  const [activeTab, setActiveTab] = useState('paraTi');
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Usuario');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userCategories, setUserCategories] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);

  // Función para manejar la navegación con feedback háptico
  const handleNavigationWithFeedback = (screen, params = {}) => {
    if (settings.hapticFeedback) {
      Vibration.vibrate(50);
    }
    navigation.navigate(screen, params);
  };

  const handleCreatePostPress = () => {
    if (settings.hapticFeedback) {
      Vibration.vibrate(50);
    }
    setShowCreateModal(true);
  };

  const handleTabChange = (tab) => {
    if (settings.hapticFeedback) {
      Vibration.vibrate(30);
    }
    setActiveTab(tab);
  };

  // --- NUEVA FUNCIÓN: Navegar a mensajes ---
  const handleNavigateToMessages = () => {
    handleNavigationWithFeedback('Mensajes');
  };

  const handleNavigateToSearch = () => {
    handleNavigationWithFeedback('SearchUsers');
  };

  const handleNavigateToSettings = () => {
    handleNavigationWithFeedback('UserConfig');
  };

  const handleNavigateToProfile = () => {
    handleNavigationWithFeedback('Perfil');
  };

  // Cargar datos del usuario en tiempo real - MODIFICADO PARA TIEMPO REAL
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setUserName('Usuario');
      return;
    }

    setCurrentUserId(user.uid);
    const userDocRef = doc(db, 'Spaghetti', 'Usuario', 'Usuario', user.uid);

    // Escuchar cambios en tiempo real del documento del usuario
    const unsubscribeUser = onSnapshot(userDocRef, (userDoc) => {
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.nombre || user.email || 'Usuario');
        setUserCategories(userData.categories || []);
        
        // Cargar lista de usuarios seguidos
        if (userData.following && userData.following.length > 0) {
          setFollowingUsers(userData.following);
        } else {
          setFollowingUsers([]);
        }
      } else {
        setUserName(user.email || 'Usuario');
        setUserCategories([]);
        setFollowingUsers([]);
      }
    }, (error) => {
      console.error('Error escuchando cambios del usuario:', error);
    });

    return unsubscribeUser;
  }, []);

  // Función para filtrar publicaciones según la pestaña activa
  const filterPostsByTab = (allPosts, tab, categories, following) => {
    if (tab === 'paraTi') {
      // Filtrar por categorías de preferencia
      if (categories && categories.length > 0) {
        return allPosts.filter(post => {
          // Si el post tiene categoría y coincide con las preferencias del usuario
          if (post.categoria && categories.includes(post.categoria)) {
            return true;
          }
          // Si no tiene categoría definida, no mostrar en "Para ti" cuando hay categorías seleccionadas
          return false;
        });
      } else {
        // Si no tiene categorías seleccionadas, mostrar todos los posts
        return allPosts;
      }
    } else if (tab === 'siguiendo') {
      // Filtrar por usuarios seguidos
      if (following && following.length > 0) {
        return allPosts.filter(post => following.includes(post.userId));
      } else {
        // Si no sigue a nadie, no mostrar posts
        return [];
      }
    }
    return allPosts;
  };

  // Cargar publicaciones desde Firebase - MODIFICADA PARA TIEMPO REAL
  useEffect(() => {
    const loadPosts = () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        let postsQuery;
        
        // Consulta base para todas las publicaciones
        postsQuery = query(
          collection(db, 'Spaghetti/Publicaciones/Publicaciones'),
          orderBy('Fecha_publicacion', 'desc')
        );

        const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
          const postsData = snapshot.docs.map(doc => {
            const postData = {
              id: doc.id,
              ...doc.data()
            };

            const userLiked = postData.likedBy && postData.likedBy.includes(user.uid);

            return {
              ...postData,
              userLiked: userLiked || false 
            };
          });
          
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
  }, [currentUserId]);

  // ACTUALIZACIÓN EN TIEMPO REAL: Filtrar posts cuando cambian las preferencias o la pestaña
  useEffect(() => {
    if (posts.length > 0) {
      const filtered = filterPostsByTab(
        posts, 
        activeTab, 
        userCategories, 
        followingUsers
      );
      setFilteredPosts(filtered);
    }
  }, [posts, activeTab, userCategories, followingUsers]);

  // Crear nueva publicación - MODIFICADA PARA INCLUIR CATEGORÍA
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
        isSaved: false,
        likedBy: [],
        Comentarios: [],
        categoria: postData.categoria // NUEVO: Incluir categoría
      };

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

  // handleLike
  const handleLike = async (postId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión para dar like');
        return;
      }

      const postRef = doc(db, 'Spaghetti/Publicaciones/Publicaciones', postId);
      const post = posts.find(p => p.id === postId);
      
      if (post) {
        if (post.userLiked) {
          await updateDoc(postRef, {
            Cant_MeGustas: (post.Cant_MeGustas || 0) - 1,
            likedBy: arrayRemove(user.uid)
          });
        } else {
          await updateDoc(postRef, {
            Cant_MeGustas: (post.Cant_MeGustas || 0) + 1,
            likedBy: arrayUnion(user.uid)
          });
        }
      }
    } catch (error) {
      console.error('Error actualizando like:', error);
      Alert.alert('Error', 'No se pudo actualizar el like');
    }
  };

  const handleSave = (postId) => {
    console.log('Guardar post:', postId);
  };

  // handleComment
  const handleComment = (postId, postTitle) => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'Debes iniciar sesión para comentar.');
      return;
    }
    setSelectedPostId(postId);
    setSelectedPostTitle(postTitle);
    setShowCommentModal(true);
  };

  // NUEVA FUNCIÓN: Navegar al perfil del usuario
  const handleUserProfilePress = (userId, userName) => {
    if (!userId) {
      Alert.alert('Error', 'No se puede acceder al perfil de este usuario');
      return;
    }

    // Si es el perfil del usuario actual, navegar a la pantalla de perfil normal
    if (userId === currentUserId) {
      handleNavigateToProfile();
    } else {
      // Navegar a la pantalla de perfil de otro usuario
      handleNavigationWithFeedback('UserProfile', { 
        userId: userId,
        userName: userName 
      });
    }
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setSelectedPostId(null);
    setSelectedPostTitle('');
  };

  // Determinar qué posts mostrar
  const postsToShow = filteredPosts;

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
      
      {/* --- HEADER MODIFICADO: Logo centrado --- */}
      <View style={[
        styles.header,
        settings.darkMode && styles.darkHeader,
        settings.highContrast && styles.highContrastHeader
      ]}>
        <TouchableOpacity onPress={handleNavigateToProfile} style={styles.headerButton}>
          <Ionicons name="person-circle-outline" size={32} color="#8B0000" />
        </TouchableOpacity>
        
        {/* LOGO CENTRADO */}
        <View style={styles.headerCenter}>
          <Text style={styles.headerLogo}>$</Text>
        </View>
        
        {/* --- CONTENEDOR PARA BOTONES DERECHOS --- */}
        <View style={styles.headerRightButtons}>
          {/* --- NUEVO BOTÓN DE MENSAJES --- */}
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleNavigateToMessages}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#8B0000" />
          </TouchableOpacity>
          
          {/* --- BOTÓN DE BÚSQUEDA --- */}
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleNavigateToSearch}
          >
            <Ionicons name="search" size={24} color="#8B0000" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleNavigateToSettings}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#8B0000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Indicadores de filtro activo */}
      <View style={styles.filterIndicators}>
        {activeTab === 'paraTi' && userCategories.length > 0 && (
          <Text style={[
            styles.filterIndicator,
            settings.largeText && { fontSize: fontSize },
            settings.boldText && { fontWeight: '500' }
          ]}>
            Mostrando {filteredPosts.length} publicaciones de {userCategories.length} categorías
          </Text>
        )}
        {activeTab === 'paraTi' && userCategories.length === 0 && (
          <Text style={[
            styles.filterIndicator,
            settings.largeText && { fontSize: fontSize },
            settings.boldText && { fontWeight: '500' }
          ]}>
            Mostrando todas las publicaciones ({filteredPosts.length})
          </Text>
        )}
        {activeTab === 'siguiendo' && followingUsers.length > 0 && (
          <Text style={[
            styles.filterIndicator,
            settings.largeText && { fontSize: fontSize },
            settings.boldText && { fontWeight: '500' }
          ]}>
            Siguiendo: {followingUsers.length} usuarios - {filteredPosts.length} publicaciones
          </Text>
        )}
        {activeTab === 'siguiendo' && followingUsers.length === 0 && (
          <Text style={[
            styles.filterIndicator,
            settings.largeText && { fontSize: fontSize },
            settings.boldText && { fontWeight: '500' }
          ]}>
            No sigues a ningún usuario
          </Text>
        )}
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
            activeTab === 'paraTi' && styles.activeTabText,
            settings.largeText && { fontSize: fontSize },
            settings.boldText && { fontWeight: 'bold' }
          ]}>
            Para ti
          </Text>
          {userCategories.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{userCategories.length}</Text>
            </View>
          )}
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
            activeTab === 'siguiendo' && styles.activeTabText,
            settings.largeText && { fontSize: fontSize },
            settings.boldText && { fontWeight: 'bold' }
          ]}>
            Siguiendo
          </Text>
          {followingUsers.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{followingUsers.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="refresh-outline" size={60} color="#CCC" />
            <Text style={[
              styles.emptyStateText,
              settings.largeText && { fontSize: fontSize + 2 },
              settings.boldText && { fontWeight: 'bold' }
            ]}>
              Cargando publicaciones...
            </Text>
          </View>
        ) : postsToShow.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name={activeTab === 'paraTi' ? "compass-outline" : "people-outline"} 
              size={60} 
              color="#CCC" 
            />
            <Text style={[
              styles.emptyStateText,
              settings.largeText && { fontSize: fontSize + 2 },
              settings.boldText && { fontWeight: 'bold' }
            ]}>
              {activeTab === 'paraTi' 
                ? userCategories.length === 0 
                  ? 'No hay publicaciones aún' 
                  : 'No hay publicaciones en tus categorías de interés'
                : followingUsers.length === 0
                  ? 'No sigues a ningún usuario'
                  : 'No hay publicaciones de usuarios que sigues'
              }
            </Text>
            <Text style={[
              styles.emptyStateSubtext,
              settings.largeText && { fontSize: fontSize },
              settings.boldText && { fontWeight: '500' }
            ]}>
              {activeTab === 'paraTi'
                ? userCategories.length === 0
                  ? 'Selecciona categorías de interés en tu perfil'
                  : 'Los usuarios que sigues no han publicado en tus categorías'
                : 'Sigue a más usuarios para ver sus publicaciones aquí'
              }
            </Text>
            {activeTab === 'paraTi' && userCategories.length === 0 && (
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => handleNavigateToProfile()}
              >
                <Text style={[
                  styles.settingsButtonText,
                  settings.largeText && { fontSize: fontSize },
                  settings.boldText && { fontWeight: '500' }
                ]}>
                  Configurar preferencias
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.createFirstButton}
              onPress={handleCreatePostPress}
            >
              <Text style={[
                styles.createFirstButtonText,
                settings.largeText && { fontSize: fontSize },
                settings.boldText && { fontWeight: 'bold' }
              ]}>
                Crear publicación
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          postsToShow.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onSave={handleSave}
              onComment={handleComment}
              onUserPress={handleUserProfilePress} // NUEVO: Pasar la función al PostCard
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={handleCreatePostPress}
      >
        <View style={styles.floatingButtonContent}>
          <Ionicons name="add" size={16} color="#FFF" />
          <Text style={[
            styles.floatingButtonText,
            settings.boldText && { fontWeight: 'bold' }
          ]}>
            Crear
          </Text>
        </View>
      </TouchableOpacity>

      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreatePost={handleCreatePost}
        userName={userName}
      />
      
      <CommentModal
        visible={showCommentModal}
        onClose={handleCloseCommentModal}
        postId={selectedPostId}
        postTitle={selectedPostTitle}
        userName={userName}
      />

      <View style={[
        styles.bottomWave,
        settings.darkMode && styles.darkBottomWave,
        settings.highContrast && styles.highContrastBottomWave
      ]} />
    </SafeAreaView>
  );
};

// Estilos - MODIFICADOS PARA HEADER CON LOGO CENTRADO
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
    backgroundColor: '#000000ff',
    paddingHorizontal: 10,
    paddingVertical: 1,
    position: 'relative',
  },
  headerButton: {
    padding: 10,
    paddingVertical: 35,
  },
  // --- NUEVO ESTILO: Contenedor para botones derechos ---
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // --- ESTILO MODIFICADO: Logo centrado ---
  headerCenter: {
    position: 'absolute',
    left: '50%',
    marginLeft: -17.5, // Mitad del ancho del logo (35/2)
    backgroundColor: '#FFA500',
    width: 35,
    height: 35,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: "center",
    top: '50%',
    marginTop: -17.5, // Mitad del alto del logo (35/2)
  },
  headerLogo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  // Nuevos estilos para filtros
  filterIndicators: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  filterIndicator: {
    fontSize: 12,
    color: '#8B0000',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  badge: {
    backgroundColor: '#FFA500',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  settingsButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#8B0000',
  },
  settingsButtonText: {
    color: '#8B0000',
    fontSize: 14,
    fontWeight: '600',
  },
  // NUEVOS ESTILOS PARA CATEGORÍAS EN POSTS
  categoryTag: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  categoryTagText: {
    color: '#FFA500',
    fontSize: 12,
    fontWeight: '600',
  },
  // NUEVO ESTILO: Contenedor para el nombre de usuario clickeable
  userNameContainer: {
    flex: 1,
    paddingVertical: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 8,
  },
  // NUEVOS ESTILOS PARA SELECTOR DE CATEGORÍAS
  categorySelectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  categorySelectorText: {
    fontSize: 16,
    color: '#999',
  },
  categorySelectedText: {
    color: '#333',
    fontWeight: '500',
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
    flexDirection: 'row',
    justifyContent: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

// Estilos para Comment Modal (se mantienen igual)
const commentStyles = StyleSheet.create({
  modalOverlay: styles.modalOverlay,
  modalContainer: {
    ...styles.modalContainer,
    minHeight: '50%',
  },
  modalHeader: styles.modalHeader,
  modalHeaderButton: styles.modalHeaderButton,
  modalTitle: styles.modalTitle,
  
  commentsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  commentItem: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#FFA500',
  },
  commentUser: {
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 2,
    fontSize: 14,
  },
  commentText: {
    fontSize: 15,
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
    backgroundColor: '#F9F9F9',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
    minHeight: 40,
    fontSize: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    textAlignVertical: 'center',
  },
  sendButton: {
    backgroundColor: '#8B0000',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendButton: {
    opacity: 0.5,
  },
});

// NUEVOS ESTILOS PARA EL MODAL DE SELECCIÓN DE CATEGORÍAS
const categoriesSelectorStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF8DC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '60%',
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
  saveButton: {
    color: '#8B0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  selectedCount: {
    fontSize: 14,
    color: '#8B0000',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  categoriesList: {
    flex: 1,
  },
  categoriesGrid: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryItem: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  categoryItemSelected: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  categoryIcon: {
    marginRight: 10,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryNameSelected: {
    color: '#FFA500',
    fontWeight: '600',
  },
});

export default FeedScreen;
