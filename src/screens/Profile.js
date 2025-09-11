// filepath: src/screens/Profile.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { auth, db } from "../firebase/config";
import { ref, onValue, remove, get, update } from "firebase/database";
import Post from "../components/Post";
import AvisoCard from "../components/AvisoCard";
import colors from "../styles/colors";
import { useNavigation } from "@react-navigation/native";

const Profile = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("Usuario");
  const [email, setEmail] = useState("");
  const [products, setProducts] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const cardContainerStyle = {
    width: isLargeScreen ? "60%" : isTablet ? "80%" : "95%",
    alignSelf: "center",
    marginBottom: 20,
  };

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setEmail(currentUser.email);

    const userRef = ref(db, `users/${currentUser.uid}`);
    get(userRef).then((snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        setUserName(userData.userName || "Usuario");
      }
    });

    const productsRef = ref(db, "products");
    const unsubProducts = onValue(productsRef, (snapshot) => {
      const all = snapshot.val() || {};
      const userProducts = Object.entries(all)
        .filter(([_, post]) => post.userId === currentUser.uid)
        .map(([id, post]) => ({ id, ...post }))
        .sort((a, b) => b.createdAt - a.createdAt);
      setProducts(userProducts);
      setLoading(false);
    });

    const avisosRef = ref(db, "avisos");
    const unsubAvisos = onValue(avisosRef, (snapshot) => {
      const all = snapshot.val() || {};
      const userAvisos = Object.entries(all)
        .filter(([_, aviso]) => aviso.userId === currentUser.uid)
        .map(([id, aviso]) => ({ id, ...aviso }))
        .sort((a, b) => b.createdAt - a.createdAt);
      setAvisos(userAvisos);
      setLoading(false);
    });

    return () => {
      unsubProducts();
      unsubAvisos();
    };
  }, []);

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigation.navigate("Login");
    });
  };

  const deleteItem = (id, tipo) => {
    const itemRef = ref(db, `${tipo}/${id}`);
    remove(itemRef).then(() => {
      if (tipo === "products") {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else if (tipo === "avisos") {
        setAvisos((prev) => prev.filter((a) => a.id !== id));
      }
    });
  };

  const handleSave = async (id, tipo) => {
    try {
      const userId = auth.currentUser.uid;
      const itemRef = ref(db, `${tipo}/${id}`);
      const snapshot = await get(itemRef);

      if (!snapshot.exists()) return;
      const itemData = snapshot.val();
      const savedBy = itemData.savedBy || {};

      if (savedBy[userId]) {
        // desguardar
        delete savedBy[userId];
        await update(ref(db, `users/${userId}/savedPosts`), {
          [id]: null,
        });
      } else {
        // guardar
        savedBy[userId] = true;
        await update(ref(db, `users/${userId}/savedPosts`), {
          [id]: tipo,
        });
      }

      await update(itemRef, { savedBy });

      // actualizar local
      if (tipo === "products") {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, savedBy } : p))
        );
      } else {
        setAvisos((prev) =>
          prev.map((a) => (a.id === id ? { ...a, savedBy } : a))
        );
      }
    } catch (err) {
      console.error("Error al guardar/desguardar:", err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Perfil de {userName}</Text>
      <Text style={styles.email}>Email: {email}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>

      {loading ? (
        <Text style={styles.loading}>Cargando...</Text>
      ) : (
        <>
          {/* Productos */}
          {products.length > 0 && (
            <>
              <Text style={styles.subtitle}>Tus Productos</Text>
              {products.map((item) => (
                <View key={item.id} style={cardContainerStyle}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("DetailPost", {
                        postId: item.id,
                        type: "products",
                      })
                    }
                  >
                    <Post
                      title={item.title}
                      images={item.images}
                      description={item.description}
                      savedCount={
                        item.savedBy ? Object.keys(item.savedBy).length : 0
                      }
                      isSaved={!!item.savedBy?.[auth.currentUser?.uid]}
                      onSave={() => handleSave(item.id, "products")}
                      postId={item.id}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteItem(item.id, "products")}
                  >
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          {/* Divider */}
          {products.length > 0 && avisos.length > 0 && (
            <View style={styles.divider} />
          )}

          {/* Avisos */}
          {avisos.length > 0 && (
            <>
              <Text style={styles.subtitle}>Tus Avisos</Text>
              {avisos.map((item) => (
                <View key={item.id} style={cardContainerStyle}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("DetailPost", {
                        postId: item.id,
                        type: "avisos",
                      })
                    }
                  >
                    <AvisoCard
                      title={item.title}
                      description={item.description}
                      date={new Date(item.createdAt).toLocaleString()}
                      savedCount={
                        item.savedBy ? Object.keys(item.savedBy).length : 0
                      }
                      isSaved={!!item.savedBy?.[auth.currentUser?.uid]}
                      onSave={() => handleSave(item.id, "avisos")}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteItem(item.id, "avisos")}
                  >
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#228bfa",
    textAlign: "center",
    marginVertical: 10,
  },
  email: {
    fontSize: 16,
    color: "#3386F9",
    textAlign: "center",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#4a90e2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    marginHorizontal: 20,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 10,
    marginHorizontal: 20,
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 20,
    marginHorizontal: 20,
  },
  loading: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default Profile;
