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
  ScrollView,
} from "react-native";
import { getDatabase, ref, get, update, remove, set } from "firebase/database";
import { auth, app } from "../firebase/config";
import colors from "../styles/colors";
import Header from "../components/Header"; // <-- agregado

const db = getDatabase(app);

const AdminScreen = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userResult, setUserResult] = useState(null);

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

  const handleEstadoChange = async (postId, tipo, newEstado) => {
    try {
      await update(ref(db, `${tipo}/${postId}`), { estado: newEstado });
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

  const handleSearchUser = async () => {
    try {
      const snap = await get(ref(db, "users"));
      if (!snap.exists()) return Alert.alert("Error", "No hay usuarios.");

      const users = snap.val();

      if (!userSearch.trim()) {
        setUserResult(
          Object.entries(users).map(([uid, data]) => ({ uid, ...data }))
        );
        return;
      }

      const found = Object.entries(users).find(
        ([uid, u]) =>
          u.email?.toLowerCase() === userSearch.toLowerCase() ||
          uid === userSearch
      );

      if (found) {
        const [uid, data] = found;
        setUserResult([{ uid, ...data }]);
      } else {
        setUserResult([]);
        Alert.alert("Sin resultados", "No se encontró el usuario.");
      }
    } catch (err) {
      console.error("Error buscando usuario:", err);
      Alert.alert("Error", "Hubo un problema al buscar usuario.");
    }
  };

  const handleDeletePublicaciones = async (uid) => {
    try {
      const tipos = ["products", "avisos"];
      for (const tipo of tipos) {
        const snap = await get(ref(db, tipo));
        if (snap.exists()) {
          const data = snap.val();
          for (const [id, post] of Object.entries(data)) {
            if (post.userId === uid) await remove(ref(db, `${tipo}/${id}`));
          }
        }
      }
      Alert.alert("Éxito", "Se eliminaron todas las publicaciones del usuario.");
      handleSearchUser();
    } catch (err) {
      console.error("Error eliminando publicaciones:", err);
      Alert.alert("Error", "No se pudieron eliminar las publicaciones.");
    }
  };

  const handleBanUser = async (uid, email) => {
    try {
      const tipos = ["products", "avisos"];
      for (const tipo of tipos) {
        const snap = await get(ref(db, tipo));
        if (snap.exists()) {
          const data = snap.val();
          for (const [id, post] of Object.entries(data)) {
            if (post.userId === uid) await remove(ref(db, `${tipo}/${id}`));
          }
        }
      }

      await remove(ref(db, `users/${uid}`));

      const sanitizeKey = (str) => str.replace(/[.#$/[\]]/g, "_");
      const sanitizedEmail = sanitizeKey(email);
      await set(ref(db, `baneados/${sanitizedEmail}`), { banned: true });

      Alert.alert(
        "Usuario baneado",
        "Se eliminaron publicaciones y se borró de la tabla users."
      );
      handleSearchUser();
    } catch (err) {
      console.error("Error baneando usuario:", err);
      Alert.alert("Error", "No se pudo banear al usuario.");
    }
  };

  const renderPublicacion = ({ item }) => (
    <View style={[styles.resultCard, styles.shadow]}>
      <Text style={styles.resultTitle}>
        {item.title} ({item.tipo})
      </Text>
      <Text style={styles.text}>{item.description}</Text>
      <Text style={styles.estadoText}>Estado: {item.estado || "normal"}</Text>
      <View style={styles.estadoRow}>
        {["normal", "promocionado", "super_promocionado"].map((estado) => (
          <TouchableOpacity
            key={estado}
            style={[styles.estadoButton, { backgroundColor: "#a3d8f4" }]}
            onPress={() => handleEstadoChange(item.id, item.tipo, estado)}
          >
            <Text style={styles.buttonTextSmall}>{estado}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderUser = ({ item: u }) => (
    <View style={[styles.resultCard, styles.shadow]}>
      <Text style={styles.resultTitle}>{u.email}</Text>
      <Text style={styles.text}>UID: {u.uid}</Text>
      <Text style={styles.text}>Teléfono: {u.phone || "No registrado"}</Text>
      <View style={styles.estadoRow}>
        <TouchableOpacity
          style={[styles.estadoButton, { backgroundColor: "#f5a623" }]}
          onPress={() => handleDeletePublicaciones(u.uid)}
        >
          <Text style={styles.buttonTextSmall}>Eliminar publicaciones</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.estadoButton, { backgroundColor: "#ff4d4d" }]}
          onPress={() => handleBanUser(u.uid, u.email)}
        >
          <Text style={styles.buttonTextSmall}>Banear usuario</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Header /> {/* <-- agregado */}
      <Text style={styles.title}>Panel de Administrador</Text>

      {/* Buscar publicaciones */}
      <TextInput
        style={styles.input}
        placeholder="Buscar publicaciones..."
        value={search}
        onChangeText={setSearch}
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: "#4caf50" }]} onPress={handleSearch}>
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderPublicacion}
        scrollEnabled={false}
      />

      {/* Gestión de usuarios */}
      <Text style={[styles.title, { marginTop: 20 }]}>Gestión de usuarios</Text>
      <TextInput
        style={styles.input}
        placeholder="Buscar usuario por email o UID..."
        value={userSearch}
        onChangeText={setUserSearch}
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: "#2196f3" }]} onPress={handleSearchUser}>
        <Text style={styles.buttonText}>Buscar usuario</Text>
      </TouchableOpacity>

      {userResult && (
        <FlatList
          data={userResult}
          keyExtractor={(u) => u.uid}
          renderItem={renderUser}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
  flex: 1,
  paddingTop: 0,  // ⬅ sin espacio arriba
  paddingBottom: 10,
  paddingHorizontal: 10,
  backgroundColor: colors.background,
},
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: colors.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  resultCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  resultTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5, color: "#333" },
  text: { fontSize: 15, color: "#555" },
  estadoText: { fontSize: 14, fontWeight: "500", marginTop: 5 },
  estadoRow: { flexDirection: "row", gap: 10, marginTop: 10, flexWrap: "wrap" },
  estadoButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonTextSmall: { color: "#fff", fontWeight: "600", fontSize: 14 },
});

export default AdminScreen;
