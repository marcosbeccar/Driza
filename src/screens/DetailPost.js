import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { getDatabase, ref, get } from "firebase/database";
import { app } from "../firebase/config";
import colors from "../styles/colors";

const db = getDatabase(app);

const DetailPost = ({ route }) => {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [authorOrg, setAuthorOrg] = useState("NO");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postSnap = await get(ref(db, `posts/${postId}`));
        if (postSnap.exists()) {
          const postData = postSnap.val();
          setPost(postData);

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

  if (!post) {
    return <Text style={styles.loading}>Cargando...</Text>;
  }

  const images = post.images || []; // Manejar posts sin imágenes

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleString();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>{post.title}</Text>

        {images.length > 0 ? (
          <View style={styles.carousel}>
            <TouchableOpacity onPress={prevImage} style={styles.arrow}>
              <Text style={styles.arrowText}>{"<"}</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: images[currentImageIndex] }}
              style={[styles.image, { width: screenWidth * 0.7, height: screenWidth * 0.7 }]}
            />
            <TouchableOpacity onPress={nextImage} style={styles.arrow}>
              <Text style={styles.arrowText}>{">"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.imagePlaceholder, { width: screenWidth * 0.7, height: screenWidth * 0.7 }]}>
            <Text style={styles.noImageText}>Sin imagen</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: colors.background,
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  loading: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    color: colors.textPrimary,
    textAlign: "center",
  },
  carousel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  image: {
    borderRadius: 10,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 15,
  },
  noImageText: {
    color: colors.textSecondary,
    fontSize: 16,
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
    textAlign: "center",
  },
});

export default DetailPost;
