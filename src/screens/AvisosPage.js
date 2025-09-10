// filepath: src/screens/AvisosPage.js
import React, { useEffect, useState } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import {
  getDatabase,
  ref,
  onValue,
  query,
  orderByChild,
  get,
  update,
} from "firebase/database";
import { app, auth } from "../firebase/config";
import colors from "../styles/colors";
import AvisoCard from "../components/AvisoCard";

const AvisosPage = ({ navigation }) => {
  const [avisos, setAvisos] = useState([]);
  const db = getDatabase(app);

  useEffect(() => {
    const avisosRef = query(ref(db, "avisos"), orderByChild("createdAt"));

    const unsubscribe = onValue(avisosRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedAvisos = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .sort((a, b) => b.createdAt - a.createdAt); // más recientes primero
        setAvisos(loadedAvisos);
      } else {
        setAvisos([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSaveAviso = async (avisoId) => {
    try {
      const userId = auth.currentUser.uid;
      const avisoRef = ref(db, `avisos/${avisoId}`);
      const snapshot = await get(avisoRef);
      if (!snapshot.exists()) return;

      const avisoData = snapshot.val();
      const savedBy = avisoData.savedBy || {};

      if (savedBy[userId]) {
        delete savedBy[userId];
        await update(ref(db, `users/${userId}/savedPosts`), {
          [avisoId]: null,
        });
      } else {
        savedBy[userId] = true;
        await update(ref(db, `users/${userId}/savedPosts`), {
          [avisoId]: "avisos",
        });
      }

      await update(avisoRef, { savedBy });

      // actualizar estado local
      setAvisos((prev) =>
        prev.map((a) => (a.id === avisoId ? { ...a, savedBy } : a))
      );
    } catch (err) {
      console.error("Error al guardar/desguardar aviso:", err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {avisos.length === 0 ? (
        <Text style={styles.emptyText}>No hay avisos publicados aún.</Text>
      ) : (
        avisos.map((aviso) => (
          <AvisoCard
            key={aviso.id}
            title={aviso.title}
            description={aviso.description}
            date={new Date(aviso.createdAt).toLocaleString()}
            savedCount={aviso.savedBy ? Object.keys(aviso.savedBy).length : 0}
            isSaved={!!aviso.savedBy?.[auth.currentUser.uid]}
            onSave={() => handleSaveAviso(aviso.id)}
            onPress={() =>
              navigation.navigate("DetailPost", { postId: aviso.id, tipo: "avisos" })
            }
          />
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 50,
  },
});

export default AvisosPage;
