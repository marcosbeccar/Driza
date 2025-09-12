// filepath: src/screens/MainPage.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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

  const renderHorizontalRow = (data) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {data.map((product) => (
        <Post
          key={product.id}
          title={product.title}
          images={product.images}
          description={product.description}
          savedCount={product.savedBy ? Object.keys(product.savedBy).length : 0}
          isSaved={!!product.savedBy?.[auth.currentUser.uid]}
          onSave={() => handleSaveProduct(product.id)}
          onPress={() =>
            navigation.navigate("DetailPost", { postId: product.id })
          }
        />
      ))}
    </ScrollView>
  );

  return (
    <ScrollView style={styles.container}>
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
        <Text style={styles.linkText}>
          ¿Buscabas ver los avisos? Click acá
        </Text>
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
  rowContainer: {
    marginBottom: 25,
  },
  rowTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  linkContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  linkText: {
    fontSize: 16,
    color: colors.primaryButton,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default MainPage;
