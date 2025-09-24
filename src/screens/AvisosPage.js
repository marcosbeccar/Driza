// filepath: src/screens/AvisosPage.js
import React, { useEffect, useState } from "react";
import { ScrollView, Text, StyleSheet, View, Dimensions, TouchableOpacity } from "react-native";
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
import Header from "../components/Header";
import Loader from "../components/Loader"; // 👈 importamos loader

const { width } = Dimensions.get("window");

const AvisosPage = ({ navigation }) => {
  const [avisos, setAvisos] = useState([]);
  const [showOnlyWithOrg, setShowOnlyWithOrg] = useState(false);
  const [loading, setLoading] = useState(true); // 👈 estado loader
  const db = getDatabase(app);

  useEffect(() => {
    const avisosRef = query(ref(db, "avisos"), orderByChild("createdAt"));

    const unsubscribe = onValue(avisosRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedAvisos = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .sort((a, b) => b.createdAt - a.createdAt);
        setAvisos(loadedAvisos);
      } else {
        setAvisos([]);
      }
      setLoading(false); // 👈 ocultar loader al terminar
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

      setAvisos((prev) =>
        prev.map((a) => (a.id === avisoId ? { ...a, savedBy } : a))
      );
    } catch (err) {
      console.error("Error al guardar/desguardar aviso:", err);
    }
  };

  // --- aplicar filtro de organizaciones ---
  let avisosFiltrados = [...avisos];
  if (showOnlyWithOrg) {
    avisosFiltrados = avisosFiltrados.filter(
      (a) => a.organizacion && a.organizacion !== "NO"
    );
  }

  // 👇 loader a pantalla completa
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Loader name="6-dots" color={colors.primaryButton} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Header />

      {/* Botón de filtro (mismo que en MainPage) */}
      <View style={styles.filterButtonWrapper}>
        <TouchableOpacity
          onPress={() => setShowOnlyWithOrg((prev) => !prev)}
          style={styles.filterButton}
        >
          <Text style={styles.filterButtonText}>
            {showOnlyWithOrg ? "Mostrar todos" : "Solo organización"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.innerContainer}>
        {avisosFiltrados.length === 0 ? (
          <Text style={styles.emptyText}>No hay avisos publicados aún.</Text>
        ) : (
          avisosFiltrados.map((aviso) => (
            <AvisoCard
              key={aviso.id}
              title={aviso.title}
              description={aviso.description}
              date={new Date(aviso.createdAt).toLocaleString()}
              organizacion={aviso.organizacion}
              savedCount={aviso.savedBy ? Object.keys(aviso.savedBy).length : 0}
              isSaved={!!aviso.savedBy?.[auth.currentUser.uid]}
              onSave={() => handleSaveAviso(aviso.id)}
              onPress={() =>
                navigation.navigate("Driza - Detalle publicacion", {
                  postId: aviso.id,
                  tipo: "avisos",
                })
              }
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  innerContainer: {
    width: width < 500 ? "90vw" : "80vw",
    alignSelf: "center",
    paddingVertical: 10,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 50,
  },
  filterButtonWrapper: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    alignItems: "flex-end",
    paddingTop: 15,
    marginBottom: 15,
  },
  filterButton: {
    backgroundColor: colors.primaryButton,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  filterButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default AvisosPage;
