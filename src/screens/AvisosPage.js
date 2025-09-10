// filepath: src/screens/AvisosPage.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { getDatabase, ref, onValue, query, orderByChild } from "firebase/database";
import { app } from "../firebase/config";
import colors from "../styles/colors";
import Post from "../components/Post"; // Reutilizamos el componente Post, pero no mostramos las imágenes en la lista

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

  return (
    <ScrollView style={styles.container}>
      {avisos.length === 0 ? (
        <Text style={styles.emptyText}>No hay avisos publicados aún.</Text>
      ) : (
        avisos.map((aviso) => (
          <TouchableOpacity
            key={aviso.id}
            onPress={() =>
              navigation.navigate("DetailAviso", { avisoId: aviso.id })
            }
          >
            <View style={styles.card}>
              <Text style={styles.title}>{aviso.title}</Text>
              <Text style={styles.description}>{aviso.description}</Text>
              <Text style={styles.date}>
                Publicado: {new Date(aviso.createdAt).toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
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
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 50,
  },
});

export default AvisosPage;
