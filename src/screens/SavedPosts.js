import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { db, auth } from "../firebase/config";
import { ref, get } from "firebase/database";
import Post from "../components/Post";
import colors from "../styles/colors";

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const userId = auth.currentUser.uid;
        const savedRef = ref(db, `users/${userId}/savedPosts`);
        const savedSnap = await get(savedRef);
        const savedPostIds = savedSnap.val() ? Object.keys(savedSnap.val()) : [];

        if (savedPostIds.length > 0) {
          const postsRef = ref(db, "posts");
          const postsSnap = await get(postsRef);
          const allPosts = postsSnap.val() || {};

          const posts = savedPostIds
            .map((id) => ({ id, ...allPosts[id] }))
            .filter((post) => post && post.title); // filtra posts existentes

          setSavedPosts(posts);
        } else {
          setSavedPosts([]);
        }
      } catch (error) {
        console.error("Error al obtener posts guardados:", error);
      }
    };

    fetchSavedPosts();
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
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default SavedPosts;
