// filepath: src/screens/SavedPosts.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { db, auth } from "../firebase/config";
import { ref, get, set, remove, update } from "firebase/database";
import colors from "../styles/colors";

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 800; // PC layout

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const fetchSavedPosts = async () => {
      try {
        const savedRef = ref(db, `users/${userId}/savedPosts`);
        const savedSnap = await get(savedRef);
        const savedPostIds = savedSnap.val() ? Object.keys(savedSnap.val()) : [];

        let posts = [];

        if (savedPostIds.length > 0) {
          const productsSnap = await get(ref(db, "products"));
          const products = productsSnap.val() || {};

          const avisosSnap = await get(ref(db, "avisos"));
          const avisos = avisosSnap.val() || {};

          savedPostIds.forEach((id) => {
            if (products[id])
              posts.push({ id, type: "producto", ...products[id] });
            else if (avisos[id]) posts.push({ id, type: "aviso", ...avisos[id] });
          });
        }

        setSavedPosts(posts);
      } catch (error) {
        console.error("Error al obtener posts guardados:", error);
      }
    };

    fetchSavedPosts();
  }, [userId]);

  const toggleSave = async (post) => {
    if (!userId) return;

    const isSaved = post.savedBy?.[userId];

    try {
      // Actualizo savedBy en producto o aviso
      const postRef =
        post.type === "producto"
          ? ref(db, `products/${post.id}/savedBy/${userId}`)
          : ref(db, `avisos/${post.id}/savedBy/${userId}`);

      if (isSaved) {
        await remove(postRef);
        await remove(ref(db, `users/${userId}/savedPosts/${post.id}`));
      } else {
        await set(postRef, true);
        await set(ref(db, `users/${userId}/savedPosts/${post.id}`), true);
      }

      // Actualizo estado local para refrescar UI
      setSavedPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                savedBy: {
                  ...(p.savedBy || {}),
                  [userId]: isSaved ? undefined : true,
                },
              }
            : p
        )
      );
    } catch (error) {
      console.error("Error guardando/desguardando post:", error);
    }
  };

  const renderItem = ({ item }) => {
    const portada = item.images?.[0]; // primera imagen si existe
    const isSaved = item.savedBy?.[userId];

    return (
      <View
        style={[
          styles.card,
          isLargeScreen ? styles.cardLarge : styles.cardMobile,
        ]}
      >
        {portada ? (
          <Image source={{ uri: portada }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.noImageText}>Sin imagen</Text>
          </View>
        )}

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.type}>
            {item.type === "producto" ? "Producto" : "Aviso"}
          </Text>

          <TouchableOpacity
            style={[styles.saveButton, isSaved ? styles.saved : styles.notSaved]}
            onPress={() => toggleSave(item)}
          >
            <Text style={styles.saveButtonText}>
              {isSaved ? "Desguardar" : "Guardar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Posts Guardados</Text>
      <FlatList
        data={savedPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
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
  header: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLarge: {
    maxWidth: 800,
    alignSelf: "center",
  },
  cardMobile: {
    width: "100%",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  saveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  saved: {
    backgroundColor: "#e74c3c",
  },
  notSaved: {
    backgroundColor: colors.primaryButton,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default SavedPosts;
