import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native-web";
import { auth, db } from "../firebase/config";
import { ref, get, onValue, remove } from "firebase/database";
import Post from "../components/Post";
import colors from "../styles/colors";
import { useNavigation } from "@react-navigation/native";

const Profile = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("Usuario");
  const [email, setEmail] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setEmail(currentUser.email);

    // Obtener datos del usuario
    const userRef = ref(db, `users/${currentUser.uid}`);
    get(userRef).then((snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        setUserName(userData.userName || "Usuario");
      }
    });

    // Obtener posts del usuario
    const postsRef = ref(db, "posts");
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const allPosts = snapshot.val() || {};
      const userPosts = Object.entries(allPosts)
        .filter(([id, post]) => post.userId === currentUser.uid)
        .map(([id, post]) => ({ id, ...post }))
        .sort((a, b) => b.createdAt - a.createdAt); // orden descendente por fecha
      setPosts(userPosts);
      setLoading(false);
    });

    return () => unsubscribe(); // cleanup listener
  }, []);

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigation.navigate("Login");
    });
  };

  const deletePost = (postId) => {
    const postRef = ref(db, `posts/${postId}`);
    remove(postRef).then(() => {
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil de {userName}</Text>
      <Text style={styles.email}>Email: {email}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Tus Posts:</Text>

      {loading ? (
        <Text>Cargando...</Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(post) => post.id}
          renderItem={({ item }) => (
            <View style={styles.postContainer}>
              <Post
                title={item.title}
                images={item.images}
                description={item.description}
                savedCount={item.savedBy ? Object.keys(item.savedBy).length : 0}
                postId={item.id}
              />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deletePost(item.id)}
              >
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
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#228bfa",
    textAlign: "center",
    marginVertical: 10,
  },
  email: {
    fontSize: 16,
    color: "#3386F9",
    textAlign: "center",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#4a90e2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a90e2",
    marginBottom: 10,
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
  text: {
    color: colors.textPrimary,
    fontSize: 16,
  },
});

export default Profile;
