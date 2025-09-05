import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../firebase/config';
import { ref, onValue, set } from "firebase/database";
import Post from '../components/Post';
import colors from '../styles/colors';

const MainPage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const postsRef = ref(db, 'posts');

    const handleData = (snapshot) => {
      const data = snapshot.val() || {};
      const fetchedPosts = Object.entries(data)
        .map(([id, post]) => ({
          id,
          ...post,
          createdAt: post.createdAt || 0,
          images: post.images || [],
        }))
        .sort((a, b) => b.createdAt - a.createdAt); // orden descendente por fecha
      setPosts(fetchedPosts);
    };

    const unsubscribe = onValue(postsRef, handleData, (error) => {
      console.error('❌ Error al leer posts:', error);
    });

    return () => unsubscribe(); // cleanup
  }, []);

  const handleSavePost = async (postId) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para guardar un post.');
      return;
    }

    const userId = user.uid;

    try {
      await set(ref(db, `users/${userId}/savedPosts/${postId}`), true);
      await set(ref(db, `posts/${postId}/savedBy/${userId}`), true);
    } catch (error) {
      console.error('❌ Error al guardar el post:', error);
      Alert.alert('Error', 'No se pudo guardar el post. Intenta nuevamente.');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Post
            title={item.title}
            images={item.images}
            description={item.description}
            savedCount={item.savedBy ? Object.keys(item.savedBy).length : 0}
            onSave={() => handleSavePost(item.id)}
            postId={item.id}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default MainPage;
