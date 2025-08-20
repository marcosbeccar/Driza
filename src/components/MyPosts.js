import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { db, auth } from "../firebase/config";
import Post from "./Post";
import colors from '../styles/colors';

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      db.ref('posts').on('value', (snapshot) => {
        const allPosts = snapshot.val() || {};
        const userPosts = Object.entries(allPosts)
          .filter(([id, post]) => post.userId === currentUser.uid)
          .map(([id, post]) => ({ id, ...post }));
        setPosts(userPosts);
        setLoading(false);
      });
    }
  }, []);

  const deletePost = (postId) => {
    db.ref(`posts/${postId}`).remove().then(() => {
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Posts</Text>
      {loading ? (
        <Text>Cargando...</Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.postContainer}>
              <Post
                title={item.title}
                images={item.images}
                description={item.description}
                savedCount={item.savedBy ? Object.keys(item.savedBy).length : 0}
                postId={item.id}
              />
              <TouchableOpacity style={styles.deleteButton} onPress={() => deletePost(item.id)}>
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    padding: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  postContainer: {
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  border: {
    borderColor: colors.border,
    borderWidth: 1,
  },
});

export default MyPosts;