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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where,
  setDoc,
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';

// IMPORTACIÓN CORREGIDA - desde la carpeta firebase/config
import { db, auth } from '../../firebase/config';

// Componente de Post
const PostCard = ({ post, onLike, onTag, onComment, onDelete, isOwner }) => (
  <View style={styles.postCard}>
    <View style={styles.postHeader}>
      <Text style={styles.userName}>{post.Nombre_Usuario || 'Usuario'}</Text>
      {isOwner && (
        <TouchableOpacity onPress={() => onDelete(post.id)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="#8B0000" />
        </TouchableOpacity>
      )}
    </View>
    <Text style={styles.postTitle}>{post.Titulo || 'Título'}</Text>
    <Text style={styles.postDescription}>{post.Descripcion || 'Descripción'}</Text>
    {/* MOSTRAR IMAGEN BASE64 O URL NORMAL */}
    {post.ImagenBase64 && (
      <Image source={{ uri: post.ImagenBase64 }} style={styles.postImage} />
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
      <TouchableOpacity onPress={() => onTag(post.id)} style={styles.actionButton}>
        <Ionicons name="bookmark-outline" size={24} color="#666" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onComment(post.id)} style={styles.actionButton}>
        <Ionicons name="chatbubble-outline" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  </View>
);

// Modal para Editar Perfil
const EditProfileModal = ({ visible, onClose, onSave, currentProfile }) => {
  const [name, setName] = useState(currentProfile.name);
  const [description, setDescription] = useState(currentProfile.description);
  const [avatar, setAvatar] = useState(currentProfile.avatar);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      avatar: avatar.trim()
    });
    
    onClose();
  };

  const handleClose = () => {
    setName(currentProfile.name);
    setDescription(currentProfile.description);
    setAvatar(currentProfile.avatar);
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
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={handleSave} style={styles.modalHeaderButton}>
              <Text style={styles.saveButton}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.avatarPreviewContainer}>
              <View style={styles.profileAvatar}>
                {currentProfile.avatar ? (
                  <Image source={{ uri: currentProfile.avatar }} style={styles.profileAvatarImage} />
                ) : (
                  <Ionicons name="person" size={40} color="#8B0000" />
                )}
              </View>
              <Text style={styles.avatarHelpText}>Tu foto de perfil</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ingresa tu nombre..."
                value={name}
                onChangeText={setName}
                maxLength={50}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe quién eres..."
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={3}
                maxLength={150}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>URL de Avatar (Opcional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://ejemplo.com/avatar.jpg"
                value={avatar}
                onChangeText={setAvatar}
                keyboardType="url"
              />
              <Text style={styles.helpText}>
                Si no agregas una URL, se usará el avatar por defecto
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveProfileButton} onPress={handleSave}>
              <Text style={styles.saveProfileButtonText}>Guardar Cambios</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Modal para Crear Publicación
const CreatePostModal = ({ visible, onClose, onCreate }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');

  const handleCreate = async () => {
    if (!titulo.trim() || !descripcion.trim()) {
      Alert.alert('Error', 'Por favor completa título y descripción');
      return;
    }

    try {
      await onCreate({
        Titulo: titulo.trim(),
        Descripcion: descripcion.trim(),
        Imagen: imagen.trim()
      });
      
      setTitulo('');
      setDescripcion('');
      setImagen('');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la publicación');
    }
  };

  const handleClose = () => {
    setTitulo('');
    setDescripcion('');
    setImagen('');
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
            <Text style={styles.modalTitle}>Crear Publicación</Text>
            <TouchableOpacity onPress={handleCreate} style={styles.modalHeaderButton}>
              <Text style={styles.saveButton}>Publicar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Título *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Título de tu publicación..."
                value={titulo}
                onChangeText={setTitulo}
                maxLength={100}
              />
            </View>

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
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>URL de Imagen (Opcional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://ejemplo.com/imagen.jpg"
                value={imagen}
                onChangeText={setImagen}
                keyboardType="url"
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Pantalla de Perfil
const ProfileScreen = ({ navigation }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState({
    name: 'Nombre',
    description: 'Descripción',
    joinDate: 'Se unió en enero del 2020',
    avatar: ''
  });

  // Cargar perfil y publicaciones al iniciar
  useEffect(() => {
    loadProfileFromFirebase();
    loadPostsFromFirebase();
  }, []);

  // Cargar perfil desde Firebase
  const loadProfileFromFirebase = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('Usuario no autenticado');
        return;
      }

      const userDocRef = doc(db, 'Spaghetti', 'Usuario', 'Usuario', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('Perfil cargado:', userData);
        setProfile({
          name: userData.nombre || 'Nombre',
          description: userData.descripcion || 'Descripción',
          joinDate: userData.fechaRegistro || 'Se unió recientemente',
          avatar: userData.avatar || ''
        });
      } else {
        // Si no existe el documento, crear uno por defecto
        console.log('Creando perfil por defecto...');
        const defaultJoinDate = new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        await setDoc(userDocRef, {
          nombre: 'Nombre',
          descripcion: 'Descripción',
          fechaRegistro: defaultJoinDate,
          avatar: '',
          userId: user.uid,
          email: user.email,
          fechaCreacion: serverTimestamp()
        });

        setProfile(prev => ({
          ...prev,
          joinDate: defaultJoinDate
        }));
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  };

  // Guardar perfil en Firebase
  const saveProfileToFirebase = async (updatedProfile) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      const userDocRef = doc(db, 'Spaghetti', 'Usuario', 'Usuario', user.uid);
      
      await setDoc(userDocRef, {
        nombre: updatedProfile.name,
        descripcion: updatedProfile.description,
        avatar: updatedProfile.avatar,
        userId: user.uid,
        email: user.email,
        ultimaActualizacion: serverTimestamp()
      }, { merge: true }); // merge: true para no sobreescribir otros campos

      console.log('Perfil guardado en Firebase');
      return true;
    } catch (error) {
      console.error('Error guardando perfil:', error);
      throw error;
    }
  };

  // Obtener publicaciones del usuario actual
  const loadPostsFromFirebase = () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'Usuario no autenticado');
      navigation.navigate('Login');
      return;
    }

    const postsQuery = query(
      collection(db, 'Spaghetti/Publicaciones/Publicaciones'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar por fecha localmente
      postsData.sort((a, b) => {
        if (a.Fecha_publicacion && b.Fecha_publicacion) {
          return b.Fecha_publicacion.toDate() - a.Fecha_publicacion.toDate();
        }
        return 0;
      });
      
      setPosts(postsData);
    }, (error) => {
      console.error('Error obteniendo posts:', error);
      Alert.alert('Error', 'No se pudieron cargar las publicaciones');
    });

    return unsubscribe;
  };

  // Crear nueva publicación
  const handleCreatePost = async (postData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      await addDoc(collection(db, 'Spaghetti/Publicaciones/Publicaciones'), {
        Titulo: postData.Titulo,
        Descripcion: postData.Descripcion,
        Imagen: postData.Imagen || '',
        Cant_MeGustas: 0,
        Fecha_publicacion: serverTimestamp(),
        userId: user.uid,
        Nombre_Usuario: profile.name,
        isLiked: false
      });

      Alert.alert('¡Éxito!', 'Publicación creada correctamente');
    } catch (error) {
      console.error('Error creando post:', error);
      Alert.alert('Error', 'No se pudo crear la publicación');
    }
  };

  // Eliminar publicación
  const handleDeletePost = async (postId) => {
    Alert.alert(
      'Eliminar Publicación',
      '¿Estás seguro de que quieres eliminar esta publicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'Spaghetti/Publicaciones/Publicaciones', postId));
              Alert.alert('¡Éxito!', 'Publicación eliminada');
            } catch (error) {
              console.error('Error eliminando post:', error);
              Alert.alert('Error', 'No se pudo eliminar la publicación');
            }
          }
        }
      ]
    );
  };

  // Like en publicación
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

  const handleTag = (postId) => {
    console.log('Tag post:', postId);
  };

  const handleComment = (postId) => {
    console.log('Comment on post:', postId);
  };

  // Guardar perfil (local y en Firebase)
  const handleSaveProfile = async (updatedProfile) => {
    try {
      // Guardar en Firebase
      await saveProfileToFirebase(updatedProfile);
      
      // Actualizar estado local
      setProfile({
        ...profile,
        ...updatedProfile
      });
      
      Alert.alert('¡Éxito!', 'Tu perfil ha sido actualizado y guardado');
    } catch (error) {
      console.error('Error guardando perfil:', error);
      Alert.alert('Error', 'No se pudo guardar el perfil en la base de datos');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
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
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.profileAvatarImage} />
            ) : (
              <Ionicons name="person" size={40} color="#8B0000" />
            )}
          </View>
          
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileDescription}>{profile.description}</Text>
          <Text style={styles.profileJoinDate}>{profile.joinDate}</Text>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}
          >
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
        {posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={60} color="#CCC" />
            <Text style={styles.emptyStateText}>No hay publicaciones aún</Text>
            <Text style={styles.emptyStateSubtext}>
              Crea tu primera publicación presionando el botón "+ Crear"
            </Text>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onTag={handleTag}
              onComment={handleComment}
              onDelete={handleDeletePost}
              isOwner={true}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => setShowCreateModal(true)}
      >
        <View style={styles.floatingButtonContent}>
          <Ionicons name="add" size={16} color="#FFF" />
          <Text style={styles.floatingButtonText}>Crear</Text>
        </View>
      </TouchableOpacity>

      {/* Modal para Editar Perfil */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProfile}
        currentProfile={profile}
      />

      {/* Modal para Crear Publicación */}
      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreatePost}
      />

      {/* Bottom Wave */}
      <View style={styles.bottomWave} />
    </SafeAreaView>
  );
};

// Los estilos se mantienen igual, solo añade este nuevo estilo:
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
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    padding: 5,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
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
  },
  avatarPreviewContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  avatarHelpText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
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
    height: 80,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
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
  saveProfileButton: {
    flex: 1,
    backgroundColor: '#8B0000',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveProfileButtonText: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
