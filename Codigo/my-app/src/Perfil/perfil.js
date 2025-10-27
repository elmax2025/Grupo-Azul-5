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
  FlatList,
  ActivityIndicator,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

// IMPORTACIÓN CORREGIDA - desde la carpeta firebase/config
import { db, auth } from '../../firebase/config';

// --- COMPONENTE: Modal de Preguntas Frecuentes ---
const FAQModal = ({ visible, onClose }) => {
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const faqData = [
    {
      id: 1,
      question: "¿Cómo cambio mi foto de perfil?",
      answer: "Ve a 'Editar Perfil' y toca tu foto de perfil. Podrás seleccionar una imagen desde tu galería para establecerla como tu foto de perfil."
    },
    {
      id: 2,
      question: "¿Cómo creo una publicación?",
      answer: "Presiona el botón 'Crear' en la parte inferior derecha de tu pantalla. Completa el título, descripción y opcionalmente agrega una imagen URL."
    },
    {
      id: 3,
      question: "¿Puedo editar o eliminar mis publicaciones?",
      answer: "Sí, solo tus publicaciones muestran el icono de eliminar (🗑️). Toca ese icono para eliminar una publicación. Actualmente la edición no está disponible."
    },
    {
      id: 4,
      question: "¿Cómo funcionan los likes en las publicaciones?",
      answer: "Toca el icono de corazón en cualquier publicación para dar like. El contador muestra cuántos likes tiene esa publicación."
    },
    {
      id: 5,
      question: "¿Qué son las categorías de preferencia?",
      answer: "Son intereses que seleccionas para personalizar tu feed. Ve a 'Categorías de Preferencia' y selecciona los temas que te interesan."
    },
    {
      id: 6,
      question: "¿Cómo busco publicaciones específicas?",
      answer: "Usa el icono de lupa en el header para búsqueda avanzada. Puedes buscar por título, descripción o fecha de publicación."
    },
    {
      id: 7,
      question: "¿Puedo seguir a otros usuarios?",
      answer: "Sí, visita perfiles de otros usuarios y usa el botón 'Seguir'. Puedes ver tus seguidores y seguidos en tu perfil."
    },
    {
      id: 8,
      question: "¿Cómo cambio mi nombre o descripción?",
      answer: "Ve a 'Editar Perfil' y modifica tu nombre y descripción en los campos correspondientes. Guarda los cambios al finalizar."
    },
    {
      id: 9,
      question: "¿Qué hago si olvidé mi contraseña?",
      answer: "En la pantalla de inicio de sesión, toca '¿Olvidaste tu contraseña?' para restablecerla mediante tu email."
    },
    {
      id: 10,
      question: "¿La app es gratuita?",
      answer: "Sí, Spaghetti es completamente gratuita. No tenemos planes de pago actualmente."
    },
    {
      id: 11,
      question: "¿Cómo reporto un problema o bug?",
      answer: "Puedes contactarnos mediante el formulario de soporte en Configuración o enviar un email a soporte@spaghetti.com"
    },
    {
      id: 12,
      question: "¿Puedo usar imágenes desde mi dispositivo?",
      answer: "Sí, para tu foto de perfil puedes seleccionar imágenes desde tu galería. Para publicaciones, actualmente necesitas una URL de imagen."
    }
  ];

  const toggleQuestion = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const renderFAQItem = ({ item }) => (
    <View style={faqStyles.faqItem}>
      <TouchableOpacity 
        style={faqStyles.questionContainer}
        onPress={() => toggleQuestion(item.id)}
      >
        <Text style={faqStyles.questionText}>{item.question}</Text>
        <Ionicons 
          name={expandedQuestion === item.id ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#8B0000" 
        />
      </TouchableOpacity>
      
      {expandedQuestion === item.id && (
        <View style={faqStyles.answerContainer}>
          <Text style={faqStyles.answerText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={faqStyles.modalOverlay}>
        <View style={faqStyles.modalContainer}>
          <View style={faqStyles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={faqStyles.modalHeaderButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={faqStyles.modalTitle}>Preguntas Frecuentes</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={faqStyles.headerSection}>
            <Ionicons name="help-circle" size={50} color="#8B0000" />
            <Text style={faqStyles.headerTitle}>Centro de Ayuda</Text>
            <Text style={faqStyles.headerSubtitle}>
              Encuentra respuestas a las preguntas más comunes sobre Spaghetti
            </Text>
          </View>

          <FlatList
            data={faqData}
            renderItem={renderFAQItem}
            keyExtractor={item => item.id.toString()}
            style={faqStyles.faqList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={faqStyles.faqContent}
          />
        </View>
      </View>
    </Modal>
  );
};

// --- COMPONENTE: Menu de Tres Puntos ---
const OptionsMenu = ({ visible, onClose, onFAQPress }) => {
  const menuOptions = [
    {
      id: 1,
      title: "Preguntas Frecuentes",
      icon: "help-circle",
      color: "#8B0000",
      onPress: onFAQPress
    },
    {
      id: 2,
      title: "Cerrar Sesión",
      icon: "log-out",
      color: "#8B0000",
      onPress: () => {
        Alert.alert(
          "Cerrar Sesión",
          "¿Estás seguro de que quieres cerrar sesión?",
          [
            { text: "Cancelar", style: "cancel" },
            { 
              text: "Cerrar Sesión", 
              style: "destructive",
              onPress: () => {
                auth.signOut();
                onClose();
              }
            }
          ]
        );
      }
    }
  ];

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity 
      style={menuStyles.menuItem}
      onPress={() => {
        item.onPress();
        onClose();
      }}
    >
      <View style={[menuStyles.menuIcon, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon} size={22} color={item.color} />
      </View>
      <Text style={menuStyles.menuText}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={16} color="#666" />
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={menuStyles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={menuStyles.menuContainer}>
          <View style={menuStyles.menuHeader}>
            <Text style={menuStyles.menuTitle}>Opciones</Text>
            <TouchableOpacity onPress={onClose} style={menuStyles.closeButton}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={menuOptions}
            renderItem={renderMenuItem}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// --- COMPONENTE: Modal de Categorías de Preferencia ---
const CategoriesModal = ({ visible, onClose, onSave, userCategories }) => {
  const [selectedCategories, setSelectedCategories] = useState(userCategories || []);
  
  // Lista de categorías disponibles
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
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSave = () => {
    onSave(selectedCategories);
    onClose();
  };

  const handleClose = () => {
    setSelectedCategories(userCategories || []);
    onClose();
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        categoriesStyles.categoryItem,
        selectedCategories.includes(item.id) && categoriesStyles.categoryItemSelected
      ]}
      onPress={() => toggleCategory(item.id)}
    >
      <View style={categoriesStyles.categoryIcon}>
        <Ionicons 
          name={item.icon} 
          size={20} 
          color={selectedCategories.includes(item.id) ? "#FFA500" : "#666"} 
        />
      </View>
      <Text style={[
        categoriesStyles.categoryName,
        selectedCategories.includes(item.id) && categoriesStyles.categoryNameSelected
      ]}>
        {item.name}
      </Text>
      {selectedCategories.includes(item.id) && (
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
      <View style={categoriesStyles.modalOverlay}>
        <View style={categoriesStyles.modalContainer}>
          <View style={categoriesStyles.modalHeader}>
            <TouchableOpacity onPress={handleClose} style={categoriesStyles.modalHeaderButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={categoriesStyles.modalTitle}>Categorías de Preferencia</Text>
            <TouchableOpacity onPress={handleSave} style={categoriesStyles.modalHeaderButton}>
              <Text style={categoriesStyles.saveButton}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <View style={categoriesStyles.modalContent}>
            <Text style={categoriesStyles.description}>
              Selecciona las categorías que más te interesan. Esto ayudará a mostrar publicaciones relevantes en tu feed "Para ti".
            </Text>
            
            <Text style={categoriesStyles.selectedCount}>
              {selectedCategories.length} de {availableCategories.length} categorías seleccionadas
            </Text>

            <FlatList
              data={availableCategories}
              renderItem={renderCategoryItem}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={categoriesStyles.categoriesGrid}
              showsVerticalScrollIndicator={false}
              style={categoriesStyles.categoriesList}
            />

            <View style={categoriesStyles.modalActions}>
              <TouchableOpacity 
                style={categoriesStyles.clearButton}
                onPress={() => setSelectedCategories([])}
              >
                <Text style={categoriesStyles.clearButtonText}>Limpiar todo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={categoriesStyles.selectAllButton}
                onPress={() => setSelectedCategories(availableCategories.map(cat => cat.id))}
              >
                <Text style={categoriesStyles.selectAllButtonText}>Seleccionar todo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- COMPONENTE: Modal de Búsqueda Avanzada ---
const AdvancedSearchModal = ({ visible, onClose, onSearch, posts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('title'); // 'title', 'description', 'date'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchTerm.trim() && searchType !== 'date') {
      Alert.alert('Error', 'Por favor ingresa un término de búsqueda');
      return;
    }

    setIsSearching(true);
    
    let results = [...posts];

    // Aplicar filtros según el tipo de búsqueda
    if (searchType === 'title') {
      results = results.filter(post => 
        post.Titulo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (searchType === 'description') {
      results = results.filter(post => 
        post.Descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (searchType === 'date') {
      if (startDate || endDate) {
        results = results.filter(post => {
          if (!post.Fecha_publicacion) return false;
          
          const postDate = post.Fecha_publicacion.toDate();
          let matches = true;

          if (startDate) {
            const start = new Date(startDate);
            matches = matches && postDate >= start;
          }

          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Incluir todo el día
            matches = matches && postDate <= end;
          }

          return matches;
        });
      }
    }

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSearchResults([]);
  };

  const handleSelectPost = (post) => {
    onSearch(post);
    onClose();
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity 
      style={searchStyles.resultItem}
      onPress={() => handleSelectPost(item)}
    >
      <View style={searchStyles.resultContent}>
        <Text style={searchStyles.resultTitle}>{item.Titulo}</Text>
        <Text style={searchStyles.resultDescription} numberOfLines={2}>
          {item.Descripcion}
        </Text>
        <Text style={searchStyles.resultDate}>
          {item.Fecha_publicacion 
            ? item.Fecha_publicacion.toDate().toLocaleDateString('es-ES')
            : 'Fecha no disponible'
          }
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  const handleClose = () => {
    handleClearFilters();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={searchStyles.modalOverlay}>
        <View style={searchStyles.modalContainer}>
          <View style={searchStyles.modalHeader}>
            <TouchableOpacity onPress={handleClose} style={searchStyles.modalHeaderButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={searchStyles.modalTitle}>Búsqueda Avanzada</Text>
            <TouchableOpacity 
              onPress={handleClearFilters} 
              style={searchStyles.modalHeaderButton}
            >
              <Text style={searchStyles.clearButton}>Limpiar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={searchStyles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Tipo de Búsqueda */}
            <View style={searchStyles.section}>
              <Text style={searchStyles.sectionTitle}>Tipo de Búsqueda</Text>
              <View style={searchStyles.filterButtons}>
                <TouchableOpacity 
                  style={[
                    searchStyles.filterButton,
                    searchType === 'title' && searchStyles.filterButtonActive
                  ]}
                  onPress={() => setSearchType('title')}
                >
                  <Text style={[
                    searchStyles.filterButtonText,
                    searchType === 'title' && searchStyles.filterButtonTextActive
                  ]}>
                    Título
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    searchStyles.filterButton,
                    searchType === 'description' && searchStyles.filterButtonActive
                  ]}
                  onPress={() => setSearchType('description')}
                >
                  <Text style={[
                    searchStyles.filterButtonText,
                    searchType === 'description' && searchStyles.filterButtonTextActive
                  ]}>
                    Descripción
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    searchStyles.filterButton,
                    searchType === 'date' && searchStyles.filterButtonActive
                  ]}
                  onPress={() => setSearchType('date')}
                >
                  <Text style={[
                    searchStyles.filterButtonText,
                    searchType === 'date' && searchStyles.filterButtonTextActive
                  ]}>
                    Fecha
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Campo de Búsqueda */}
            {(searchType === 'title' || searchType === 'description') && (
              <View style={searchStyles.section}>
                <Text style={searchStyles.sectionTitle}>
                  Buscar en {searchType === 'title' ? 'títulos' : 'descripciones'}
                </Text>
                <TextInput
                  style={searchStyles.textInput}
                  placeholder={`Ingresa palabras clave...`}
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </View>
            )}

            {/* Filtro por Fecha */}
            {searchType === 'date' && (
              <View style={searchStyles.section}>
                <Text style={searchStyles.sectionTitle}>Filtrar por Fecha</Text>
                <View style={searchStyles.dateContainer}>
                  <View style={searchStyles.dateInputContainer}>
                    <Text style={searchStyles.dateLabel}>Desde:</Text>
                    <TextInput
                      style={searchStyles.dateInput}
                      placeholder="YYYY-MM-DD"
                      value={startDate}
                      onChangeText={setStartDate}
                    />
                  </View>
                  <View style={searchStyles.dateInputContainer}>
                    <Text style={searchStyles.dateLabel}>Hasta:</Text>
                    <TextInput
                      style={searchStyles.dateInput}
                      placeholder="YYYY-MM-DD"
                      value={endDate}
                      onChangeText={setEndDate}
                    />
                  </View>
                </View>
                <Text style={searchStyles.helpText}>
                  Formato: AAAA-MM-DD (ej: 2024-01-15)
                </Text>
              </View>
            )}

            {/* Botón de Búsqueda */}
            <TouchableOpacity 
              style={searchStyles.searchButton}
              onPress={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <Text style={searchStyles.searchButtonText}>Buscando...</Text>
              ) : (
                <Text style={searchStyles.searchButtonText}>
                  Buscar ({posts.length} publicaciones)
                </Text>
              )}
            </TouchableOpacity>

            {/* Resultados de Búsqueda */}
            {searchResults.length > 0 && (
              <View style={searchStyles.resultsSection}>
                <Text style={searchStyles.resultsTitle}>
                  Resultados ({searchResults.length})
                </Text>
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchResult}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  style={searchStyles.resultsList}
                />
              </View>
            )}

            {searchResults.length === 0 && (searchTerm || startDate || endDate) && !isSearching && (
              <View style={searchStyles.emptyState}>
                <Ionicons name="search-outline" size={50} color="#CCC" />
                <Text style={searchStyles.emptyStateText}>No se encontraron resultados</Text>
                <Text style={searchStyles.emptyStateSubtext}>
                  Prueba con otros términos o filtros de búsqueda
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// --- COMPONENTE: Modal para listar Seguidos/Seguidores ---
const FollowModal = ({ visible, onClose, type, users, currentUserId, navigation }) => {
  const handleViewProfile = (userId) => {
    onClose();
    navigation.navigate('UserProfile', { userId });
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={followStyles.userItem}
      onPress={() => handleViewProfile(item.id)}
    >
      <View style={followStyles.userInfo}>
        <View style={followStyles.avatar}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={followStyles.avatarImage} />
          ) : (
            <Ionicons name="person" size={24} color="#8B0000" />
          )}
        </View>
        <View style={followStyles.userDetails}>
          <Text style={followStyles.userName}>{item.nombre || 'Usuario'}</Text>
          <Text style={followStyles.userEmail}>{item.email}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={followStyles.modalOverlay}>
        <View style={followStyles.modalContainer}>
          <View style={followStyles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={followStyles.modalHeaderButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={followStyles.modalTitle}>
              {type === 'following' ? 'Seguidos' : 'Seguidores'}
            </Text>
            <View style={{ width: 44 }} />
          </View>

          {users.length === 0 ? (
            <View style={followStyles.emptyState}>
              <Ionicons 
                name={type === 'following' ? "people-outline" : "person-outline"} 
                size={60} 
                color="#CCC" 
              />
              <Text style={followStyles.emptyStateText}>
                {type === 'following' 
                  ? 'No sigues a ningún usuario aún' 
                  : 'No tienes seguidores aún'
                }
              </Text>
              <Text style={followStyles.emptyStateSubtext}>
                {type === 'following'
                  ? 'Busca usuarios y comienza a seguirles'
                  : 'Comparte tu perfil para conseguir seguidores'
                }
              </Text>
            </View>
          ) : (
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={item => item.id}
              style={followStyles.usersList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

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
    {/* MOSTRAR IMAGEN BASE64 O URL NORMAL - Misma estructura que Feed.js */}
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

// Modal para Editar Perfil - CON BASE64 (Misma estructura que Feed.js)
const EditProfileModal = ({ visible, onClose, onSave, currentProfile, onImagePick }) => {
  const [name, setName] = useState(currentProfile.name);
  const [description, setDescription] = useState(currentProfile.description);
  const [avatar, setAvatar] = useState(currentProfile.avatar);
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      avatar: avatar
    });
  };

  const handleClose = () => {
    setName(currentProfile.name);
    setDescription(currentProfile.description);
    setAvatar(currentProfile.avatar);
    onClose();
  };

  const handleImagePick = async () => {
    try {
      setIsUploading(true);
      const imageBase64 = await onImagePick();
      if (imageBase64) {
        setAvatar(imageBase64);
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo cargar la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  // Resetear el estado cuando el modal se abre/cierra
  useEffect(() => {
    if (visible) {
      setName(currentProfile.name);
      setDescription(currentProfile.description);
      setAvatar(currentProfile.avatar);
    }
  }, [visible, currentProfile]);

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
              <TouchableOpacity 
                style={styles.avatarUploadButton}
                onPress={handleImagePick}
                disabled={isUploading}
              >
                <View style={styles.profileAvatar}>
                  {isUploading ? (
                    <ActivityIndicator size="large" color="#8B0000" />
                  ) : avatar ? (
                    <Image source={{ uri: avatar }} style={styles.profileAvatarImage} />
                  ) : (
                    <Ionicons name="person" size={40} color="#8B0000" />
                  )}
                </View>
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={20} color="#FFF" />
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHelpText}>
                {isUploading ? 'Cargando imagen...' : 'Toca para cambiar foto'}
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre *</Text>
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
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.saveProfileButton, 
                (!name.trim() || isUploading) && styles.saveProfileButtonDisabled
              ]} 
              onPress={handleSave}
              disabled={!name.trim() || isUploading}
            >
              <Text style={styles.saveProfileButtonText}>
                {isUploading ? 'Guardando...' : 'Guardar Cambios'}
              </Text>
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

// FUNCIÓN PARA CONVERTIR IMAGEN A BASE64 - Misma estructura que Feed.js
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

// Pantalla de Perfil
const ProfileScreen = ({ navigation }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [followModalType, setFollowModalType] = useState('following');
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [userCategories, setUserCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Nombre',
    description: 'Descripción',
    joinDate: 'Se unió en enero del 2020',
    avatar: ''
  });

  const currentUserId = auth.currentUser?.uid;

  // Solicitar permisos al cargar el componente
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permisos de galería no concedidos');
      }
    })();
  }, []);

  // Cargar perfil, publicaciones y datos de seguimiento al iniciar
  useEffect(() => {
    loadProfileFromFirebase();
    loadPostsFromFirebase();
    loadFollowData();
    loadUserCategories();
  }, []);

  // FUNCIÓN PARA SELECCIONAR IMAGEN - Misma estructura que Feed.js
  const handleImagePick = async () => {
    try {
      console.log('Iniciando selección de imagen...');
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios', 
          'Necesitamos acceso a tu galería para cambiar la foto de perfil.'
        );
        return null;
      }

      // Configuración de ImagePicker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: false, // No usar base64 de ImagePicker directamente
      });

      console.log('Resultado de ImagePicker:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const imageUri = asset.uri;
        
        console.log('URI de imagen seleccionada:', imageUri);
        
        // Validaciones básicas
        if (!imageUri) {
          throw new Error('No se pudo obtener la URI de la imagen');
        }

        if (!currentUserId) {
          throw new Error('Usuario no autenticado');
        }

        setIsUploading(true);
        
        // Mostrar feedback al usuario
        Alert.alert('Procesando imagen', 'Por favor espera mientras se procesa tu foto de perfil...');
        
        // Convertir imagen a Base64 usando la misma función que Feed.js
        const base64Image = await uploadImage(imageUri);
        
        console.log('Imagen convertida a Base64 exitosamente');
        Alert.alert('¡Éxito!', 'Foto de perfil actualizada correctamente');
        return base64Image;
      } else if (result.canceled) {
        console.log('Selección de imagen cancelada por el usuario');
      } else {
        console.log('No se seleccionó ninguna imagen');
      }
      
      return null;
    } catch (error) {
      console.error('Error en handleImagePick:', error);
      
      let errorMessage = 'No se pudo procesar la imagen. ';
      
      if (error.message.includes('permisos')) {
        errorMessage += 'Verifica los permisos de la aplicación.';
      } else if (error.message.includes('tamaño')) {
        errorMessage += 'La imagen es demasiado grande.';
      } else {
        errorMessage += error.message;
      }
      
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Cargar categorías del usuario
  const loadUserCategories = async () => {
    try {
      if (!currentUserId) return;

      const userDocRef = doc(db, 'Spaghetti', 'Usuario', 'Usuario', currentUserId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserCategories(userData.categories || []);
      }
    } catch (error) {
      console.error('Error cargando categorías del usuario:', error);
    }
  };

  // Guardar categorías del usuario
  const handleSaveCategories = async (categories) => {
    try {
      if (!currentUserId) {
        Alert.alert('Error', 'Debes iniciar sesión para guardar preferencias');
        return;
      }

      const userDocRef = doc(db, 'Spaghetti', 'Usuario', 'Usuario', currentUserId);
      
      await setDoc(userDocRef, {
        categories: categories,
        ultimaActualizacion: serverTimestamp()
      }, { merge: true });

      setUserCategories(categories);
      Alert.alert('¡Éxito!', 'Tus preferencias de categorías han sido guardadas');
    } catch (error) {
      console.error('Error guardando categorías:', error);
      Alert.alert('Error', 'No se pudieron guardar las categorías');
    }
  };

  // Manejar resultado de búsqueda
  const handleSearchResult = (post) => {
    setFilteredPosts([post]);
  };

  // Restablecer vista normal
  const resetPostsView = () => {
    setFilteredPosts([]);
  };

  // Cargar datos de seguimiento
  const loadFollowData = async () => {
    try {
      if (!currentUserId) return;

      const userDocRef = doc(db, 'Spaghetti', 'Usuario', 'Usuario', currentUserId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const followingIds = userData.following || [];
        
        const followingUsers = await getUsersInfo(followingIds);
        setFollowing(followingUsers);
        
        const followersQuery = query(
          collection(db, 'Spaghetti', 'Usuario', 'Usuario'),
          where('following', 'array-contains', currentUserId)
        );
        
        const followersSnapshot = await getDocs(followersQuery);
        const followersData = followersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter(user => user.id !== currentUserId);
        
        setFollowers(followersData);
      }
    } catch (error) {
      console.error('Error cargando datos de seguimiento:', error);
    }
  };

  // Obtener información de usuarios por sus IDs
  const getUsersInfo = async (userIds) => {
    if (!userIds || userIds.length === 0) return [];

    const usersInfo = [];
    for (const userId of userIds) {
      try {
        const userDocRef = doc(db, 'Spaghetti', 'Usuario', 'Usuario', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          usersInfo.push({
            id: userId,
            ...userDoc.data()
          });
        }
      } catch (error) {
        console.error(`Error obteniendo info del usuario ${userId}:`, error);
      }
    }
    return usersInfo;
  };

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
          fechaCreacion: serverTimestamp(),
          following: [],
          categories: []
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
      
      // ORDENAMIENTO LOCAL
      postsData.sort((a, b) => {
        try {
          const dateA = a.Fecha_publicacion ? a.Fecha_publicacion.toDate() : new Date(0);
          const dateB = b.Fecha_publicacion ? b.Fecha_publicacion.toDate() : new Date(0);
          return dateB - dateA;
        } catch (error) {
          return 0;
        }
      });
      
      setPosts(postsData);
      setFilteredPosts([]);
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
      console.log('Guardando perfil...', updatedProfile);
      
      setIsUploading(true);
      
      // Guardar en Firebase
      await saveProfileToFirebase(updatedProfile);
      
      // Actualizar estado local
      setProfile({
        ...profile,
        ...updatedProfile
      });
      
      Alert.alert('¡Éxito!', 'Tu perfil ha sido actualizado y guardado');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error guardando perfil:', error);
      Alert.alert('Error', `No se pudo guardar el perfil: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Guardar perfil en Firebase
  const saveProfileToFirebase = async (updatedProfile) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      console.log('Guardando en Firebase para usuario:', user.uid);

      const userDocRef = doc(db, 'Spaghetti', 'Usuario', 'Usuario', user.uid);
      
      const profileData = {
        nombre: updatedProfile.name,
        descripcion: updatedProfile.description,
        avatar: updatedProfile.avatar,
        userId: user.uid,
        email: user.email,
        ultimaActualizacion: serverTimestamp()
      };

      console.log('Datos a guardar en Firebase:', profileData);

      await setDoc(userDocRef, profileData, { merge: true });

      console.log('Perfil guardado exitosamente en Firebase');
      return true;
    } catch (error) {
      console.error('Error detallado guardando en Firebase:', error);
      throw new Error(`Error de Firebase: ${error.message}`);
    }
  };

  // Manejar clic en botones de seguidos/seguidores
  const handleFollowButtonPress = (type) => {
    setFollowModalType(type);
    setShowFollowModal(true);
  };

  const handleCloseFollowModal = () => {
    setShowFollowModal(false);
  };

  // Manejar búsqueda avanzada
  const handleAdvancedSearch = () => {
    setShowSearchModal(true);
  };

  const handleCloseSearchModal = () => {
    setShowSearchModal(false);
  };

  // Manejar categorías
  const handleCategoriesPress = () => {
    setShowCategoriesModal(true);
  };

  const handleCloseCategoriesModal = () => {
    setShowCategoriesModal(false);
  };

  // NUEVAS FUNCIONES PARA MANEJAR LOS MODALES
  const handleOptionsMenuPress = () => {
    setShowOptionsMenu(true);
  };

  const handleCloseOptionsMenu = () => {
    setShowOptionsMenu(false);
  };

  const handleFAQPress = () => {
    setShowFAQModal(true);
    setShowOptionsMenu(false);
  };

  const handleCloseFAQModal = () => {
    setShowFAQModal(false);
  };

  // Determinar qué posts mostrar (todos o filtrados)
  const postsToShow = filteredPosts.length > 0 ? filteredPosts : posts;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          {/* BOTÓN DE BÚSQUEDA AVANZADA */}
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleAdvancedSearch}
          >
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
          {/* BOTÓN DE TRES PUNTOS ACTUALIZADO */}
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleOptionsMenuPress}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            {isUploading ? (
              <ActivityIndicator size="large" color="#8B0000" />
            ) : profile.avatar ? (
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

          {/* BOTÓN: Categorías de Preferencia */}
          <TouchableOpacity 
            style={styles.categoriesButton}
            onPress={handleCategoriesPress}
          >
            <Ionicons name="pricetags" size={16} color="#8B0000" />
            <Text style={styles.categoriesButtonText}>
              Categorías de Preferencia {userCategories.length > 0 && `(${userCategories.length})`}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.followContainer}>
            <TouchableOpacity 
              style={styles.followButton}
              onPress={() => handleFollowButtonPress('following')}
            >
              <Text style={styles.followCount}>{following.length}</Text>
              <Text style={styles.followButtonText}>Seguidos</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.followButton}
              onPress={() => handleFollowButtonPress('followers')}
            >
              <Text style={styles.followCount}>{followers.length}</Text>
              <Text style={styles.followButtonText}>Seguidores</Text>
            </TouchableOpacity>
          </View>

          {/* Indicador de búsqueda activa */}
          {filteredPosts.length > 0 && (
            <TouchableOpacity 
              style={styles.searchIndicator}
              onPress={resetPostsView}
            >
              <Text style={styles.searchIndicatorText}>
                Mostrando {filteredPosts.length} resultado(s) de búsqueda
              </Text>
              <Ionicons name="close" size={16} color="#8B0000" />
            </TouchableOpacity>
          )}
        </View>

        {/* User Posts */}
        {postsToShow.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={60} color="#CCC" />
            <Text style={styles.emptyStateText}>
              {filteredPosts.length === 0 ? 'No hay publicaciones aún' : 'No se encontraron resultados'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {filteredPosts.length === 0 
                ? 'Crea tu primera publicación presionando el botón "+ Crear"'
                : 'Intenta con otros términos de búsqueda'
              }
            </Text>
          </View>
        ) : (
          postsToShow.map((post) => (
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
        onImagePick={handleImagePick}
        currentProfile={profile}
      />

      {/* Modal para Crear Publicación */}
      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreatePost}
      />

      {/* Modal: Seguidos/Seguidores */}
      <FollowModal
        visible={showFollowModal}
        onClose={handleCloseFollowModal}
        type={followModalType}
        users={followModalType === 'following' ? following : followers}
        currentUserId={currentUserId}
        navigation={navigation}
      />

      {/* Modal: Categorías de Preferencia */}
      <CategoriesModal
        visible={showCategoriesModal}
        onClose={handleCloseCategoriesModal}
        onSave={handleSaveCategories}
        userCategories={userCategories}
      />

      {/* Modal: Búsqueda Avanzada */}
      <AdvancedSearchModal
        visible={showSearchModal}
        onClose={handleCloseSearchModal}
        onSearch={handleSearchResult}
        posts={posts}
      />

      {/* MODAL: Menu de Opciones */}
      <OptionsMenu
        visible={showOptionsMenu}
        onClose={handleCloseOptionsMenu}
        onFAQPress={handleFAQPress}
      />

      {/* MODAL: Preguntas Frecuentes */}
      <FAQModal
        visible={showFAQModal}
        onClose={handleCloseFAQModal}
      />

      {/* Bottom Wave */}
      <View style={styles.bottomWave} />
    </SafeAreaView>
  );
};

// Estilos principales (se mantienen iguales)
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
    width: 120,
    height: 120,
    borderRadius: 60,
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
    marginBottom: 15,
  },
  editButtonText: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: '500',
  },
  categoriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#8B0000',
    gap: 8,
  },
  categoriesButtonText: {
    color: '#8B0000',
    fontSize: 14,
    fontWeight: '500',
  },
  followContainer: {
    flexDirection: 'row',
    gap: 30,
  },
  followButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 100,
  },
  followCount: {
    color: '#FFA500',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  followButtonText: {
    color: '#FFA500',
    fontSize: 14,
    fontWeight: '500',
  },
  searchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#8B0000',
    gap: 8,
  },
  searchIndicatorText: {
    color: '#8B0000',
    fontSize: 12,
    fontWeight: '500',
  },
  avatarUploadButton: {
    position: 'relative',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#8B0000',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
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
  saveProfileButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
});

// Estilos para el Modal de Preguntas Frecuentes (se mantienen iguales)
const faqStyles = StyleSheet.create({
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
    minHeight: '80%',
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
  headerSection: {
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  faqList: {
    flex: 1,
  },
  faqContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  faqItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  answerContainer: {
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

// Estilos para el Menú de Opciones (se mantienen iguales)
const menuStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    width: 250,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

// Estilos para el Modal de Categorías (se mantienen iguales)
const categoriesStyles = StyleSheet.create({
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
  modalActions: {
    flexDirection: 'row',
    paddingVertical: 20,
    gap: 10,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  selectAllButton: {
    flex: 1,
    backgroundColor: '#8B0000',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectAllButtonText: {
    color: '#FFA500',
    fontSize: 14,
    fontWeight: '500',
  },
});

// Estilos para el Modal de Búsqueda Avanzada (se mantienen iguales)
const searchStyles = StyleSheet.create({
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
  clearButton: {
    color: '#8B0000',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFA500',
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
  dateContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFF',
    color: '#333',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  searchButton: {
    backgroundColor: '#8B0000',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  searchButtonText: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsSection: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
});

// Estilos para el Modal de Seguidos/Seguidores (se mantienen iguales)
const followStyles = StyleSheet.create({
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
    minHeight: '50%',
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
  usersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userItem: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProfileScreen;
