import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SharedPosts = ({ navigation }) => {
  const [sharedPosts] = useState([]); // Por ahora vacío

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B0000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publicaciones Compartidas</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {sharedPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="share-social-outline" size={60} color="#CCC" />
            <Text style={styles.emptyStateText}>No has compartido publicaciones</Text>
            <Text style={styles.emptyStateSubtext}>
              Las publicaciones que compartas aparecerán aquí
            </Text>
          </View>
        ) : (
          sharedPosts.map((post) => (
            <Text key={post.id}>Publicación compartida</Text>
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

export default SharedPosts;
