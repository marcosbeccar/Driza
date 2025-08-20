import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { db, auth } from '../firebase/config';
import Post from '../components/Post';
import colors from '../styles/colors'; 

const MainPage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const postsRef = db.ref('posts');
    const handleData = (snapshot) => {
      const data = snapshot.val() || {};
      // Convierte el objeto en array y ordena por createdAt descendente
      const fetchedPosts = Object.entries(data)
        .map(([id, post]) => ({ id, ...post }))
        .sort((a, b) => b.createdAt - a.createdAt);
      setPosts(fetchedPosts);
    };
    postsRef.on('value', handleData);
    return () => postsRef.off('value', handleData);
  }, []);

  const handleSavePost = (postId) => {
    const userId = auth.currentUser.uid;
    db.ref(`users/${userId}/savedPosts/${postId}`).set(true);
    db.ref(`posts/${postId}/savedBy/${userId}`).set(true);
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
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default MainPage;