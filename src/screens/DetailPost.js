import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { getDatabase, ref, get } from "firebase/database";
import { app } from "../firebase/config"; // importa el app inicializado
import colors from "../styles/colors";

const db = getDatabase(app);

const DetailPost = ({ route }) => {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [authorOrg, setAuthorOrg] = useState("NO");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postSnap = await get(ref(db, `posts/${postId}`));
        if (postSnap.exists()) {
          const postData = postSnap.val();
          setPost(postData);

          // Obtener organización del autor
          const authorSnap = await get(ref(db, `users/${postData.userId}/organizacion`));
          if (authorSnap.exists()) {
            setAuthorOrg(authorSnap.val());
          }
        }
      } catch (error) {
        console.error("Error al cargar la publicación:", error);
      }
    };

    fetchPost();
  }, [postId]);

  if (!post) return <Text style={styles.loading}>Cargando...</Text>;

  const nextImage = () => {
    if (post.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
    }
  };

  const prevImage = () => {
    if (post.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? post.images.length - 1 : prev - 1
      );
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleString();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{post.title}</Text>

      {post.images.length > 0 && (
        <View style={styles.carousel}>
          <TouchableOpacity onPress={prevImage} style={styles.arrow}>
            <Text style={styles.arrowText}>{"<"}</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: post.images[currentImageIndex] }}
            style={styles.image}
          />
          <TouchableOpacity onPress={nextImage} style={styles.arrow}>
            <Text style={styles.arrowText}>{">"}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.description}>{post.description}</Text>
      <Text style={styles.date}>Publicado: {formattedDate}</Text>

      {authorOrg === "NO" && (
        <Text style={styles.warning}>
          ⚠️ El autor de esta publicación no pertenece a la organización
        </Text>
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
  loading: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: colors.textPrimary,
  },
  carousel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 8,
  },
  arrow: {
    paddingHorizontal: 10,
  },
  arrowText: {
    fontSize: 30,
    color: colors.primaryButton,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  warning: {
    color: "red",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 10,
  },
});

export default DetailPost;
