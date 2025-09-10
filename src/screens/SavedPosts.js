// filepath: src/screens/SavedPosts.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, useWindowDimensions, ScrollView } from "react-native";
import { db, auth } from "../firebase/config";
import { ref, onValue, get, update } from "firebase/database";
import Post from "../components/Post";
import AvisoCard from "../components/AvisoCard";
import colors from "../styles/colors";

const SavedPosts = () => {
  const [savedProducts, setSavedProducts] = useState([]);
  const [savedAvisos, setSavedAvisos] = useState([]);
  const { width } = useWindowDimensions();

  const isLargeScreen = width > 800;
  const cardContainerStyle = {
    width: isLargeScreen ? 700 : "95%",
    alignSelf: "center",
    marginBottom: 12,
  };

  useEffect(() => {
    const userId = auth.currentUser.uid;
    const savedRef = ref(db, `users/${userId}/savedPosts`);

    const unsubscribe = onValue(savedRef, async (snapshot) => {
      const savedData = snapshot.val() || {};
      const productos = [];
      const avisos = [];

      for (const [postId, tipo] of Object.entries(savedData)) {
        const postRef = ref(db, `${tipo}/${postId}`);
        const postSnap = await get(postRef);
        if (postSnap.exists()) {
          const post = { id: postId, tipo, ...postSnap.val() };
          if (tipo === "products") productos.push(post);
          else if (tipo === "avisos") avisos.push(post);
        }
      }

      setSavedProducts(productos);
      setSavedAvisos(avisos);
    });

    return () => unsubscribe();
  }, []);

  const toggleSave = async (postId, tipo) => {
    try {
      const userId = auth.currentUser.uid;
      const postRef = ref(db, `${tipo}/${postId}`);
      const snapshot = await get(postRef);
      if (!snapshot.exists()) return;

      const postData = snapshot.val();
      const savedBy = postData.savedBy || {};

      if (savedBy[userId]) {
        delete savedBy[userId];
        await update(ref(db, `users/${userId}/savedPosts`), { [postId]: null });
      } else {
        savedBy[userId] = true;
        await update(ref(db, `users/${userId}/savedPosts`), { [postId]: tipo });
      }

      await update(postRef, { savedBy });
    } catch (err) {
      console.error("Error al guardar/desguardar:", err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Posts Guardados</Text>

      {/* Productos */}
      {savedProducts.length > 0 && (
        <>
          <Text style={styles.subtitle}>Productos Guardados</Text>
          {savedProducts.map((item) => (
            <View key={item.id} style={cardContainerStyle}>
              <Post
                title={item.title}
                images={item.images}
                description={item.description}
                savedCount={item.savedBy ? Object.keys(item.savedBy).length : 0}
                isSaved={!!item.savedBy?.[auth.currentUser.uid]}
                onSave={() => toggleSave(item.id, item.tipo)}
              />
            </View>
          ))}
        </>
      )}

      {/* Divider */}
      {savedProducts.length > 0 && savedAvisos.length > 0 && (
        <View style={styles.divider} />
      )}

      {/* Avisos */}
      {savedAvisos.length > 0 && (
        <>
          <Text style={styles.subtitle}>Avisos Guardados</Text>
          {savedAvisos.map((item) => (
            <View key={item.id} style={cardContainerStyle}>
              <AvisoCard
                title={item.title}
                description={item.description}
                date={new Date(item.createdAt).toLocaleString()}
                savedCount={item.savedBy ? Object.keys(item.savedBy).length : 0}
                isSaved={!!item.savedBy?.[auth.currentUser.uid]}
                onSave={() => toggleSave(item.id, item.tipo)}
              />
            </View>
          ))}
        </>
      )}
    </ScrollView>
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
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 20,
  },
});

export default SavedPosts;
