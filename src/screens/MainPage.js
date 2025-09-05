import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import {
  getDatabase,
  ref,
  onValue,
  query,
  orderByChild,
} from "firebase/database";
import { app } from "../firebase/config";
import colors from "../styles/colors";
import { useNavigation } from "@react-navigation/native";

const MainPage = () => {
  const [posts, setPosts] = useState([]);
  const navigation = useNavigation();

  const db = getDatabase(app);

  useEffect(() => {
    const postsRef = query(ref(db, "posts"), orderByChild("createdAt"));

    const unsubscribe = onValue(postsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedPosts = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .sort((a, b) => b.createdAt - a.createdAt); // más nuevos primero

        setPosts(loadedPosts);
      } else {
        setPosts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const renderPost = ({ item }) => {
    const portada = item.images?.[0]; // mostrar solo la primera como portada

    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => navigation.navigate("DetailPost", { postId: item.id })}
      >
        {portada && <Image source={{ uri: portada }} style={styles.image} />}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {posts.length === 0 ? (
        <Text style={styles.empty}>No hay publicaciones disponibles.</Text>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 10,
  },
  list: {
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  empty: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
    color: colors.textSecondary,
  },
});

export default MainPage;
