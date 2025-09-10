// filepath: src/screens/DetailPost.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Button,
} from "react-native";
import { getDatabase, ref, get, update } from "firebase/database";
import { auth, app } from "../firebase/config";
import colors from "../styles/colors";

const db = getDatabase(app);

const DetailPost = ({ route, navigation }) => {
  const { postId, type = "products" } = route.params; // type: "products" o "avisos"
  const [post, setPost] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 800;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postSnap = await get(ref(db, `${type}/${postId}`));
        if (postSnap.exists()) setPost(postSnap.val());
      } catch (error) {
        console.error("Error al cargar la publicación:", error);
      }
    };
    fetchPost();
  }, [postId, type]);

  if (!post) return <Text style={styles.loading}>Cargando...</Text>;

  const images = post.images || [];
  const savedCount = post.savedBy ? Object.keys(post.savedBy).length : 0;

  const nextImage = () => {
    if (images.length > 0)
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length > 0)
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const postRef = ref(db, `${type}/${postId}/savedBy/${user.uid}`);
      await update(postRef, true);

      // Refrescar localmente
      setPost((prev) => ({
        ...prev,
        savedBy: { ...prev.savedBy, [user.uid]: true },
      }));
    } catch (err) {
      console.error("Error guardando:", err);
    }
  };

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleString()
    : "";

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backButton}>⬅ Volver</Text>
      </TouchableOpacity>

      <View style={[styles.card, isLargeScreen && styles.cardLarge]}>
        {/* Imagen o placeholder */}
        {images.length > 0 ? (
          <View style={styles.carousel}>
            <TouchableOpacity onPress={prevImage} style={styles.arrow}>
              <Text style={styles.arrowText}>{"<"}</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: images[currentImageIndex] }}
              style={[
                styles.image,
                {
                  width: isLargeScreen ? width * 0.3 : width * 0.7,
                  height: isLargeScreen ? width * 0.3 : width * 0.7,
                },
              ]}
            />
            <TouchableOpacity onPress={nextImage} style={styles.arrow}>
              <Text style={styles.arrowText}>{">"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              {
                width: isLargeScreen ? width * 0.3 : width * 0.7,
                height: isLargeScreen ? width * 0.3 : width * 0.7,
              },
            ]}
          >
            <Text style={styles.noImageText}>Sin imagen</Text>
          </View>
        )}

        {/* Texto y datos */}
        <View style={[styles.textSection, isLargeScreen && styles.textSectionLarge]}>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.description}>{post.description}</Text>
          {post.createdAt && <Text style={styles.date}>Publicado: {formattedDate}</Text>}

          <View style={styles.authorBox}>
            <Text style={styles.authorTitle}>Datos del autor</Text>
            {post.authorEmail && <Text style={styles.authorText}>📧 {post.authorEmail}</Text>}
            {post.authorPhone && <Text style={styles.authorText}>📱 {post.authorPhone}</Text>}
          </View>

          {post.authorOrg === "NO" && (
            <Text style={styles.warning}>
              ⚠️ El autor de esta publicación no pertenece a la organización
            </Text>
          )}

          <View style={{ marginTop: 10 }}>
            <Button title={`Guardar (${savedCount})`} onPress={handleSave} />
          </View>
        </View>
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
  backButton: {
    fontSize: 16,
    color: colors.primaryButton,
    marginBottom: 15,
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
  cardLarge: {
    flexDirection: "row",
    gap: 20,
  },
  loading: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 50,
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
  arrow: { paddingHorizontal: 10 },
  arrowText: {
    fontSize: 30,
    color: colors.primaryButton,
    fontWeight: "bold",
  },
  textSection: { marginTop: 15 },
  textSectionLarge: { flex: 1, marginTop: 0 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 15, color: colors.textPrimary },
  description: { fontSize: 16, color: colors.textSecondary, marginBottom: 10 },
  date: { fontSize: 14, color: colors.textSecondary, marginBottom: 10 },
  authorBox: { marginTop: 15, padding: 10, borderRadius: 8, backgroundColor: "#f9f9f9" },
  authorTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5, color: colors.textPrimary },
  authorText: { fontSize: 14, color: colors.textSecondary, marginBottom: 3 },
  warning: { color: "red", fontWeight: "bold", fontSize: 14, marginTop: 10 },
});

export default DetailPost;
