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
  Modal,
  PanResponder,
  Alert,
} from "react-native";
import { getDatabase, ref, get, update } from "firebase/database";
import { auth, app } from "../firebase/config";
import colors from "../styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import Header from "../components/Header";

const db = getDatabase(app);

const DetailPost = ({ route, navigation }) => {
  const { postId, tipo = "products" } = route.params;
  const [post, setPost] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 800;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postSnap = await get(ref(db, `${tipo}/${postId}`));
        if (postSnap.exists()) setPost(postSnap.val());
      } catch (error) {
        console.error("Error al cargar la publicación:", error);
      }
    };
    fetchPost();
  }, [postId, tipo]);

  if (!post) return <Text style={styles.loading}>Cargando...</Text>;

  const images = post.images || [];
  const savedBy = post.savedBy || {};
  const isSaved = !!savedBy[auth.currentUser.uid];
  const savedCount = Object.keys(savedBy).length;

  const nextImage = () => {
    if (images.length > 0)
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = () => {
    if (images.length > 0)
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
  };

  const handleSave = async () => {
    try {
      const userId = auth.currentUser.uid;
      const postRef = ref(db, `${tipo}/${postId}`);
      const snapshot = await get(postRef);
      if (!snapshot.exists()) return;

      const postData = snapshot.val();
      const updatedSavedBy = postData.savedBy || {};

      if (updatedSavedBy[userId]) {
        delete updatedSavedBy[userId];
        await update(ref(db, `users/${userId}/savedPosts`), { [postId]: null });
      } else {
        updatedSavedBy[userId] = true;
        await update(ref(db, `users/${userId}/savedPosts`), { [postId]: tipo });
      }

      await update(postRef, { savedBy: updatedSavedBy });
      setPost((prev) => ({ ...prev, savedBy: updatedSavedBy }));
    } catch (err) {
      console.error("Error al guardar/desguardar:", err);
    }
  };

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleString()
    : "";

  const handleAuthorPress = () => {
    if (!post.userId) return;
    navigation.navigate("Perfil", { userId: post.userId });
  };

  const handleEdit = () => {
    if (tipo === "products") navigation.navigate("Driza - Editar producto", { postId });
    else navigation.navigate("Driza - Editar aviso", { postId });
  };

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20,
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx < -20) nextImage();
      else if (gesture.dx > 20) prevImage();
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButton}>⬅ Volver</Text>
        </TouchableOpacity>

        <View style={[styles.card, isLargeScreen && styles.cardLarge]}>
          {images.length > 0 ? (
            <View style={styles.carousel}>
              <TouchableOpacity onPress={prevImage} style={styles.arrow}>
                <Text style={styles.arrowText}>{"<"}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => openModal(currentImageIndex)}>
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
              </TouchableOpacity>

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

          <View style={[styles.textSection, isLargeScreen && styles.textSectionLarge]}>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.description}>{post.description}</Text>
            {post.createdAt && <Text style={styles.date}>Publicado: {formattedDate}</Text>}

            {post.userId === auth.currentUser.uid && (
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editButtonText}>✏️ Editar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.authorBox}
              onPress={handleAuthorPress}
              activeOpacity={0.8}
            >
              <Text style={styles.authorTitle}>Datos de contacto</Text>
              {post.email && <Text style={styles.authorText}>📧 {post.email}</Text>}
              {post.phone && <Text style={styles.authorText}>📱 {post.phone}</Text>}
            </TouchableOpacity>

            {post.organizacion === "NO" && (
              <Text style={styles.warning}>
                ⚠️ El autor de esta publicación no pertenece a la organización
              </Text>
            )}

            <View style={styles.saveContainer}>
              <TouchableOpacity onPress={handleSave}>
                <MaterialIcons
                  name={isSaved ? "bookmark" : "bookmark-border"}
                  size={32}
                  color={isSaved ? "#05383a" : "#888"}
                />
              </TouchableOpacity>
              <Text style={styles.savedCount}>{savedCount} usuario/s</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalBackground} {...panResponder.panHandlers}>
          <TouchableOpacity style={styles.modalClose} onPress={closeModal}>
            <Text style={{ color: "#fff", fontSize: 18 }}>Cerrar ✕</Text>
          </TouchableOpacity>

          <Image
            source={{ uri: images[currentImageIndex] }}
            style={styles.modalImage}
          />

          <View style={styles.modalArrows}>
            <TouchableOpacity onPress={prevImage} style={styles.modalArrow}>
              <Text style={styles.modalArrowText}>{"<"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={nextImage} style={styles.modalArrow}>
              <Text style={styles.modalArrowText}>{">"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: colors.background,
  },
  backButtonContainer: { alignSelf: "flex-start", marginBottom: 15, marginLeft: 20 },
  backButton: { fontSize: 16, color: colors.primaryButton },
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
  cardLarge: { flexDirection: "row", gap: 20 },
  loading: { fontSize: 16, color: colors.textSecondary, textAlign: "center", marginTop: 50 },
  carousel: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 15 },
  image: { borderRadius: 10, resizeMode: "cover" },
  imagePlaceholder: { backgroundColor: colors.border, justifyContent: "center", alignItems: "center", borderRadius: 10, marginBottom: 15 },
  noImageText: { color: colors.textSecondary, fontSize: 16 },
  arrow: { paddingHorizontal: 10 },
  arrowText: { fontSize: 30, color: colors.primaryButton, fontWeight: "bold" },
  textSection: { marginTop: 15 },
  textSectionLarge: { flex: 1, marginTop: 0 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 15, color: colors.textPrimary },
  description: { fontSize: 16, color: colors.textSecondary, marginBottom: 10 },
  date: { fontSize: 14, color: colors.textSecondary, marginBottom: 10 },
  authorBox: { marginTop: 15, padding: 10, borderRadius: 8, backgroundColor: "#f9f9f9" },
  authorTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5, color: colors.textPrimary },
  authorText: { fontSize: 14, color: colors.textSecondary, marginBottom: 3 },
  warning: { color: "red", fontWeight: "bold", fontSize: 14, marginTop: 10 },
  saveContainer: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 10 },
  savedCount: { fontSize: 14, color: colors.textSecondary },
  editButton: { marginTop: 15, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.primaryButton, borderRadius: 6, alignSelf: "flex-start" },
  editButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
  modalImage: { width: "90%", height: "80%", resizeMode: "contain" },
  modalClose: { position: "absolute", top: 50, right: 20 },
  modalArrows: { position: "absolute", width: "100%", flexDirection: "row", justifyContent: "space-between", top: "50%" },
  modalArrow: { padding: 20 },
  modalArrowText: { color: "#fff", fontSize: 40, fontWeight: "bold" },
});

export default DetailPost;
