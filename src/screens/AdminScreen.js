// filepath: src/screens/AdminScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { getDatabase, ref, get, update, remove } from "firebase/database";
import { auth, app } from "../firebase/config";
import colors from "../styles/colors";

const db = getDatabase(app);

const AdminScreen = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userResult, setUserResult] = useState(null);

  // 🔎 Buscar publicaciones
  const handleSearch = async () => {
    try {
      const tipos = ["products", "avisos"];
      let allResults = [];

      for (const tipo of tipos) {
        const snap = await get(ref(db, tipo));
        if (snap.exists()) {
          const data = snap.val();
          const filtrados = Object.entries(data)
            .map(([id, post]) => ({ id, tipo, ...post }))
            .filter(
              (p) =>
                p.title?.toLowerCase().includes(search.toLowerCase()) ||
                p.description?.toLowerCase().includes(search.toLowerCase()) ||
                p.id === search
            );
          allResults = [...allResults, ...filtrados];
        }
      }

      setResults(allResults);
    } catch (err) {
      console.error("Error buscando publicaciones:", err);
      Alert.alert("Error", "Hubo un problema al buscar publicaciones.");
    }
  };

  // 🔄 Cambiar estado de una publicación
  const handleEstadoChange = async (postId, tipo, newEstado) => {
    try {
      await update(ref(db, `${tipo}/${postId}`), { estado: newEstado });
      Alert.alert("Éxito", "Estado actualizado");
      setResults((prev) =>
        prev.map((p) =>
          p.id === postId && p.tipo === tipo ? { ...p, estado: newEstado } : p
        )
      );
    } catch (err) {
      console.error("Error actualizando estado:", err);
      Alert.alert("Error", "No se pudo actualizar el estado.");
    }
  };

  // 🔎 Buscar usuario
  const handleSearchUser = async () => {
    try {
      const snap = await get(ref(db, "users"));
      if (!snap.exists()) return Alert.alert("Error", "No hay usuarios.");

      const users = snap.val();
      const found = Object.entries(users).find(
        ([uid, u]) =>
          u.email?.toLowerCase() === userSearch.toLowerCase() ||
          uid === userSearch
      );

      if (found) {
        const [uid, data] = found;
        setUserResult({ uid, ...data });
      } else {
        setUserResult(null);
        Alert.alert("Sin resultados", "No se encontró el usuario.");
      }
    } catch (err) {
      console.error("Error buscando usuario:", err);
      Alert.alert("Error", "Hubo un problema al buscar usuario.");
    }
  };

  // ❌ Borrar usuario
  const handleDeleteUser = async (uid) => {
    try {
      await remove(ref(db, `users/${uid}`));
      Alert.alert("Usuario eliminado", "La cuenta fue borrada.");
      setUserResult(null);
    } catch (err) {
      console.error("Error eliminando usuario:", err);
      Alert.alert("Error", "No se pudo eliminar el usuario.");
    }
  };

  // 🚫 Banear usuario
  const handleBanUser = async (email) => {
    try {
      await update(ref(db, `banned/${encodeURIComponent(email)}`), {
        banned: true,
      });
      Alert.alert("Usuario baneado", `${email} fue baneado permanentemente.`);
      setUserResult(null);
    } catch (err) {
      console.error("Error baneando usuario:", err);
      Alert.alert("Error", "No se pudo banear al usuario.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administrador</Text>

      {/* 🔎 Buscar publicaciones */}
      <TextInput
        style={styles.input}
        placeholder="Buscar publicaciones..."
        value={search}
        onChangeText={setSearch}
      />
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>
              {item.title} ({item.tipo})
            </Text>
            <Text>{item.description}</Text>
            <Text>Estado: {item.estado || "normal"}</Text>
            <View style={styles.estadoRow}>
              {["normal", "promocionado", "super_promocionado"].map((estado) => (
                <TouchableOpacity
                  key={estado}
                  style={styles.estadoButton}
                  onPress={() => handleEstadoChange(item.id, item.tipo, estado)}
                >
                  <Text>{estado}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      />

      {/* 🔎 Buscar usuario */}
      <Text style={[styles.title, { marginTop: 20 }]}>Gestión de usuarios</Text>
      <TextInput
        style={styles.input}
        placeholder="Buscar usuario por email o UID..."
        value={userSearch}
        onChangeText={setUserSearch}
      />
      <TouchableOpacity style={styles.button} onPress={handleSearchUser}>
        <Text style={styles.buttonText}>Buscar usuario</Text>
      </TouchableOpacity>

      {userResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Usuario: {userResult.email}</Text>
          <Text>UID: {userResult.uid}</Text>
          <Text>Teléfono: {userResult.phone || "No registrado"}</Text>

          <View style={styles.estadoRow}>
            <TouchableOpacity
              style={styles.estadoButton}
              onPress={() => handleDeleteUser(userResult.uid)}
            >
              <Text>Eliminar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.estadoButton}
              onPress={() => handleBanUser(userResult.email)}
            >
              <Text>Banear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: colors.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: colors.primaryButton,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  resultCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  resultTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  estadoRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  estadoButton: {
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 6,
  },
});

export default AdminScreen;
