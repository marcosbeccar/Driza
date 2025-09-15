// filepath: src/screens/MainPage.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
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
import Post from "../components/Post";
import Ionicons from "react-native-vector-icons/Ionicons";

const MainPage = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width
  );
  const db = getDatabase(app);

  useEffect(() => {
    const handleResize = ({ window }) => setWindowWidth(window.width);
    const subscription = Dimensions.addEventListener("change", handleResize);
    return () => subscription?.remove?.();
  }, []);

  const isMobile = windowWidth < 500;

  useEffect(() => {
    const productsRef = query(ref(db, "products"), orderByChild("createdAt"));
    const unsubscribe = onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedProducts = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .sort((a, b) => b.createdAt - a.createdAt);
        setProducts(loadedProducts);
      } else {
        setProducts([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSaveProduct = async (productId) => {
    try {
      const userId = auth.currentUser.uid;
      const productRef = ref(db, `products/${productId}`);
      const snapshot = await get(productRef);
      if (!snapshot.exists()) return;

      const productData = snapshot.val();
      const savedBy = productData.savedBy || {};

      if (savedBy[userId]) {
        delete savedBy[userId];
        await update(ref(db, `users/${userId}/savedPosts`), {
          [productId]: null,
        });
      } else {
        savedBy[userId] = true;
        await update(ref(db, `users/${userId}/savedPosts`), {
          [productId]: "products",
        });
      }

      await update(productRef, { savedBy });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, savedBy } : p))
      );
    } catch (err) {
      console.error("Error al guardar/desguardar producto:", err);
    }
  };

  const promocionados = products.filter((p) => p.estado === "promocionado");
  const normales = products.filter((p) => !p.estado || p.estado === "normal");
  const normalRows = [[], [], []];
  normales.forEach((product, idx) => normalRows[idx % 3].push(product));

  const renderHorizontalRow = (data) => {
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
        style={{ position: "relative", marginBottom: 10 }}
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
          contentContainerStyle={{ paddingHorizontal: 10 }}
          ref={scrollRef}
          onScroll={(e) => {
            scrollX.current = e.nativeEvent.contentOffset.x;
          }}
          scrollEventThrottle={16}
        >
          {data.map((product) => (
            <View key={product.id} style={{ marginRight: 10 }}>
              <Post
                title={product.title}
                images={product.images}
                description={product.description}
                savedCount={
                  product.savedBy ? Object.keys(product.savedBy).length : 0
                }
                isSaved={!!product.savedBy?.[auth.currentUser.uid]}
                onSave={() => handleSaveProduct(product.id)}
                onPress={() =>
                  navigation.navigate("DetailPost", { postId: product.id })
                }
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { paddingHorizontal: isMobile ? 10 : 40 }]}
      contentContainerStyle={{ alignItems: "center" }}
      showsVerticalScrollIndicator={false}
    >
      {promocionados.length > 0 && (
        <View style={styles.rowContainer}>
          <Text style={styles.rowTitle}>Promocionados</Text>
          {renderHorizontalRow(promocionados)}
        </View>
      )}
      {normalRows.map((row, idx) => (
        <View style={styles.rowContainer} key={idx}>
          <Text style={styles.rowTitle}>Normal - Fila {idx + 1}</Text>
          {renderHorizontalRow(row)}
        </View>
      ))}
      <TouchableOpacity
        onPress={() => navigation.navigate("Avisos")}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>¿Buscabas ver los avisos? Click acá</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 10,
  },
  rowContainer: { marginBottom: 25, width: "100%", maxWidth: 1200 },
  rowTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  linkContainer: { marginVertical: 20, alignItems: "center" },
  linkText: {
    fontSize: 16,
    color: colors.primaryButton,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  scrollButton: {
    position: "absolute",
    top: "35%",
    width: 28,
    height: 28,
    backgroundColor: "rgba(150,42,81,0.85)", // #962a51 con transparencia
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});

export default MainPage;
