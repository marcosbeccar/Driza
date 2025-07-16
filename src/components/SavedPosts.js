import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { db, auth } from "../firebase/config";
import Post from "./Post";

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    const userId = auth.currentUser.uid;
    db.ref(`users/${userId}/savedPosts`).once('value', (snapshot) => {
      const savedPostIds = snapshot.val() ? Object.keys(snapshot.val()) : [];
      if (savedPostIds.length > 0) {
        db.ref('posts').once('value', (postsSnap) => {
          const allPosts = postsSnap.val() || {};
          const posts = savedPostIds
            .map(id => ({ id, ...allPosts[id] }))
            .filter(post => post.title); // filtra si el post existe
          setSavedPosts(posts);
        });
      } else {
        setSavedPosts([]);
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Posts Guardados</Text>
      <FlatList
        data={savedPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Post
            title={item.title}
            images={item.images}
            description={item.description}
            savedCount={item.savedBy ? Object.keys(item.savedBy).length : 0}
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
    padding: 20,
    backgroundColor: "#c3e6fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default SavedPosts;