import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { getDatabase, ref, onValue, query, orderByChild, update } from "firebase/database";
import { app, auth } from "../firebase/config";
import colors from "../styles/colors";
import Post from "../components/Post";
import { useNavigation } from "@react-navigation/native";

const MainPage = () => {
  const [posts, setPosts] = useState([]);
  const db = getDatabase(app);
  const navigation = useNavigation();

  useEffect(() => {
    const postsRef = query(ref(db, "posts"), orderByChild("createdAt"));

    const unsubscribe = onValue(postsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedPosts = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .sort((a, b) => b.createdAt - a.createdAt); // más nuevos primero
        setPosts(loadedPosts);
      } else {
        setPosts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSavePost = async (postId) => {
    const userId = auth.currentUser.uid;
    await update(ref(db, `users/${userId}/savedPosts`), { [postId]: true });
    await update(ref(db, `posts/${postId}/savedBy`), { [userId]: true });
  };

  // Filtrar por categoría
  const promocionados = posts.filter((p) => p.categoria === "promocionado");
  const normales = posts.filter((p) => !p.categoria || p.categoria === "normal");

  // Distribuir normales en 3 filas
  const normalRows = [[], [], []];
  normales.forEach((post, idx) => normalRows[idx % 3].push(post));

  const renderHorizontalRow = (data) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {data.map((post) => (
        <Post
          key={post.id}
          title={post.title}
          images={post.images}
          description={post.description}
          savedCount={post.savedBy ? Object.keys(post.savedBy).length : 0}
          onSave={() => handleSavePost(post.id)}
          onPress={() => navigation.navigate("DetailPost", { postId: post.id })}
        />
      ))}
    </ScrollView>
  );

  return (
    <ScrollView style={styles.container}>
      {promocionados.length > 0 && (
        <View style={styles.rowContainer}>
          <Text style={styles.rowTitle}>Promocionados</Text>
          {renderHorizontalRow(promocionados)}
        </View>
      )}

      {normalRows.map((row, idx) => (
        <View style={styles.rowContainer} key={idx}>
          <Text style={styles.rowTitle}>Normal - Fila {idx + 1}</Text>
          {renderHorizontalRow(row)}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 10,
  },
  rowContainer: {
    marginBottom: 25,
  },
  rowTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginHorizontal: 10,
    marginBottom: 10,
  },
});

export default MainPage;
