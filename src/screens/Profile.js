import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { auth, db } from "../firebase/config";
import { ref, onValue, get, remove, update } from "firebase/database";
import Post from "../components/Post";
import AvisoCard from "../components/AvisoCard";
import colors from "../styles/colors";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

const HorizontalRow = ({ data, onSave, onPressItem, isMobile }) => {
  const scrollRef = useRef(null);
  const scrollX = useRef(0);
  const [hovered, setHovered] = useState(false);

  const scrollBy = (offset) => {
    if (scrollRef.current) {
      const newX = Math.max(0, scrollX.current + offset);
      scrollRef.current.scrollTo({ x: newX, animated: true });
      scrollX.current = newX;
    }
  };

  return (
    <View
      style={{ width: isMobile ? "95vw" : "88vw", alignSelf: "center" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!isMobile && hovered && (
        <>
          <TouchableOpacity
            style={[styles.scrollButton, { left: -12 }]}
            onPress={() => scrollBy(-250)}
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.scrollButton, { right: -12 }]}
            onPress={() => scrollBy(250)}
          >
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </>
      )}
      <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  ref={scrollRef}
  onScroll={(e) => { scrollX.current = e.nativeEvent.contentOffset.x; }}
  scrollEventThrottle={16}
>
  <View
    style={{
      flexDirection: "row",
      paddingLeft: isMobile ? 10 : 50,
      paddingRight: isMobile ? 10 : 50,
      width: isMobile ? "95vw" : "85vw",
      alignSelf: "center",
    }}
  >
    {data.map((item) => (
      <View key={item.id} style={{ marginRight: 10 }}>
        <Post
          title={item.title}
          images={item.images}
          description={item.description}
          savedCount={item.savedBy ? Object.keys(item.savedBy).length : 0}
          isSaved={!!item.savedBy?.[auth.currentUser.uid]}
          onSave={() => onSave(item.id, item.tipo)}
          onPress={() => onPressItem(item)}
        />
        <TouchableOpacity
          style={{ ...styles.deleteButton, width: "100%" }} // ancho completo del contenedor
          onPress={() => onSave(item.id, item.tipo, true)}
        >
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    ))}
  </View>
</ScrollView>

    </View>
  );
};

const Profile = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("Usuario");
  const [email, setEmail] = useState("");
  const [products, setProducts] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [windowWidth, setWindowWidth] = useState(Dimensions.get("window").width);

  const isMobile = windowWidth < 500;
  const cardWidth = isMobile ? "90vw" : "50vw";

  useEffect(() => {
    const handleResize = ({ window }) => setWindowWidth(window.width);
    const subscription = Dimensions.addEventListener("change", handleResize);
    return () => subscription?.remove?.();
  }, []);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setEmail(currentUser.email);

    const userRef = ref(db, `users/${currentUser.uid}`);
    get(userRef).then((snapshot) => {
      const userData = snapshot.val();
      if (userData) setUserName(userData.userName || "Usuario");
    });

    const productsRef = ref(db, "products");
    const unsubProducts = onValue(productsRef, (snapshot) => {
      const all = snapshot.val() || {};
      const userProducts = Object.entries(all)
        .filter(([_, post]) => post.userId === currentUser.uid)
        .map(([id, post]) => ({ id, ...post, tipo: "products" }))
        .sort((a, b) => b.createdAt - a.createdAt);
      setProducts(userProducts);
      setLoading(false);
    });

    const avisosRef = ref(db, "avisos");
    const unsubAvisos = onValue(avisosRef, (snapshot) => {
      const all = snapshot.val() || {};
      const userAvisos = Object.entries(all)
        .filter(([_, aviso]) => aviso.userId === currentUser.uid)
        .map(([id, aviso]) => ({ id, ...aviso, tipo: "avisos" }))
        .sort((a, b) => b.createdAt - a.createdAt);
      setAvisos(userAvisos);
      setLoading(false);
    });

    return () => {
      unsubProducts();
      unsubAvisos();
    };
  }, []);

  const handleSave = async (id, tipo, isDelete = false) => {
    try {
      const userId = auth.currentUser.uid;
      const itemRef = ref(db, `${tipo}/${id}`);
      const snapshot = await get(itemRef);

      if (!snapshot.exists()) return;

      if (isDelete) {
        await remove(itemRef);
        if (tipo === "products") setProducts((prev) => prev.filter((p) => p.id !== id));
        else setAvisos((prev) => prev.filter((a) => a.id !== id));
        return;
      }

      const itemData = snapshot.val();
      const savedBy = itemData.savedBy || {};
      if (savedBy[userId]) delete savedBy[userId];
      else savedBy[userId] = true;
      await update(itemRef, { savedBy });

      if (tipo === "products") setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, savedBy } : p)));
      else setAvisos((prev) => prev.map((a) => (a.id === id ? { ...a, savedBy } : a)));
    } catch (err) {
      console.error("Error al guardar/desguardar:", err);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: "center" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{email}</Text>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => auth.signOut().then(() => navigation.navigate("Auth"))}
      >
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>

      {loading ? (
        <Text style={styles.loading}>Cargando...</Text>
      ) : (
        <>
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity style={[styles.tab, activeTab === "products" && styles.activeTab]} onPress={() => setActiveTab("products")}>
              <Text style={[styles.tabText, activeTab === "products" && styles.activeTabText]}>Productos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === "avisos" && styles.activeTab]} onPress={() => setActiveTab("avisos")}>
              <Text style={[styles.tabText, activeTab === "avisos" && styles.activeTabText]}>Avisos</Text>
            </TouchableOpacity>
          </View>

          {/* Productos */}
          {activeTab === "products" && products.length > 0 && (
            <View style={styles.rowContainer}>
              <HorizontalRow
                data={products}
                onSave={handleSave}
                onPressItem={(item) => navigation.navigate("DetailPost", { postId: item.id, tipo: "products" })}
                isMobile={isMobile}
              />
            </View>
          )}

          {/* Avisos */}
          {activeTab === "avisos" && avisos.length > 0 && (
            <View style={styles.rowContainer}>
              {avisos.map((item) => (
                <View key={item.id} style={[styles.avisoCardWrapper, { width: cardWidth }]}>
                  <AvisoCard
                    title={item.title}
                    description={item.description}
                    date={new Date(item.createdAt).toLocaleString()}
                    savedCount={item.savedBy ? Object.keys(item.savedBy).length : 0}
                    isSaved={!!item.savedBy?.[auth.currentUser?.uid]}
                    onSave={() => handleSave(item.id, "avisos")}
                    onPress={() => navigation.navigate("DetailPost", { postId: item.id, tipo: "avisos" })}
                  />
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleSave(item.id, "avisos", true)}>
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingVertical: 20 },
  header: { marginBottom: 20, alignItems: "center" },
  userName: { fontSize: 28, fontWeight: "bold", color: colors.textPrimary },
  userEmail: { fontSize: 16, color: colors.textSecondary, marginTop: 5 },
  logoutButton: {
    backgroundColor: colors.primaryButton,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 25,
    minWidth: "60%",
  },
  logoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  tabsContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  tab: { paddingVertical: 10, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: "transparent" },
  activeTab: { borderBottomColor: colors.primaryButton },
  tabText: { fontSize: 16, color: colors.textSecondary },
  activeTabText: { color: colors.primaryButton, fontWeight: "bold" },
  rowContainer: { width: "100%", maxWidth: 1200, marginBottom: 25 },
  scrollButton: { position: "absolute", top: "35%", width: 28, height: 28, backgroundColor: colors.primaryButton, borderRadius: 14, justifyContent: "center", alignItems: "center", zIndex: 10 },
  avisoCardWrapper: { marginBottom: 20, alignSelf: "center" },
  deleteButton: { marginTop: 8, backgroundColor: colors.error, paddingVertical: 8, borderRadius: 5, alignItems: "center" },
  deleteButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  loading: { textAlign: "center", marginTop: 50, fontSize: 16, color: colors.textSecondary },
});

export default Profile;
