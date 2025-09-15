// filepath: src/screens/MainPage.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
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

const { width } = Dimensions.get("window");

const MainPage = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const db = getDatabase(app);

  useEffect(() => {
    const productsRef = query(ref(db, "products"), orderByChild("createdAt"));

    const unsubscribe = onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedProducts = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .sort((a, b) => b.createdAt - a.createdAt); // más nuevos primero
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
        // Si ya estaba guardado -> desguardar
        delete savedBy[userId];
        await update(ref(db, `users/${userId}/savedPosts`), {
          [productId]: null,
        });
      } else {
        // Guardar
        savedBy[userId] = true;
        await update(ref(db, `users/${userId}/savedPosts`), {
          [productId]: "products",
        });
      }

      await update(productRef, { savedBy });

      // actualizar localmente el estado
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, savedBy } : p
        )
      );
    } catch (err) {
      console.error("Error al guardar/desguardar producto:", err);
    }
  };

  // Separar por estado
  const promocionados = products.filter((p) => p.estado === "promocionado");
  const normales = products.filter((p) => !p.estado || p.estado === "normal");

  // Distribuir normales en 3 filas
  const normalRows = [[], [], []];
  normales.forEach((product, idx) => {
    normalRows[idx % 3].push(product);
  });

  const renderHorizontalRow = (data) => {
    const scrollRef = useRef(null);

    const scrollBy = (offset) => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          x: scrollRef.current._scrollPos + offset,
          animated: true,
        });
      }
    };

    return (
      <View style={styles.horizontalWrapper}>
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={() => scrollBy(-250)}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={colors.textPrimary}
          />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          ref={(ref) => {
            scrollRef.current = {
              _ref: ref,
              _scrollPos: 0,
              scrollTo: (opts) => ref?.scrollTo(opts),
            };
          }}
          onScroll={(e) => {
            scrollRef.current._scrollPos = e.nativeEvent.contentOffset.x;
          }}
          scrollEventThrottle={16}
        >
          {data.map((product) => (
            <Post
              key={product.id}
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
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.arrowButton}
          onPress={() => scrollBy(250)}
        >
          <Ionicons
            name="chevron-forward"
            size={28}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.innerContainer}>
        {promocionados.length > 0 && (
          <View style={styles.rowContainer}>
            <Text style={styles.rowTitle}>🔥 Promocionados</Text>
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
          <Text style={styles.linkText}>
            ¿Buscabas ver los avisos? Click acá
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: "100%",
    ...(Platform.OS === "web" && {
      maxWidth: "80vw",
      alignSelf: "center",
    }),
  },
  rowContainer: {
    marginBottom: 30,
  },
  rowTitle: {
    fontSize: width < 400 ? 16 : 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginHorizontal: 8,
    marginBottom: 12,
  },
  horizontalWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrowButton: {
    width: 32,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  linkContainer: {
    marginVertical: 25,
    alignItems: "center",
  },
  linkText: {
    fontSize: width < 400 ? 14 : 16,
    color: colors.primaryButton,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default MainPage;
