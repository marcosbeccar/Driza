// filepath: src/screens/SearchResults.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { ref, get, child } from "firebase/database";
import { db, auth } from "../firebase/config";
import Post from "../components/Post";
import AvisoCard from "../components/AvisoCard";
import colors from "../styles/colors";
import Header from "../components/Header"; // <-- agregado

const SearchResults = ({ route, navigation }) => {
  const { query } = route.params;
  const [products, setProducts] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width
  );

  const isMobile = windowWidth < 500;

  useEffect(() => {
    const handleResize = ({ window }) => setWindowWidth(window.width);
    const sub = Dimensions.addEventListener("change", handleResize);
    return () => sub?.remove?.();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const snapshotProducts = await get(child(ref(db), "products"));
        const snapshotAvisos = await get(child(ref(db), "avisos"));

        const allProducts = snapshotProducts.exists()
          ? Object.entries(snapshotProducts.val()).map(([id, p]) => ({
              id,
              ...p,
            }))
          : [];
        const allAvisos = snapshotAvisos.exists()
          ? Object.entries(snapshotAvisos.val()).map(([id, a]) => ({
              id,
              ...a,
            }))
          : [];

        const lowerQuery = query.toLowerCase();

        const filteredProducts = allProducts.filter(
          (p) =>
            p.title?.toLowerCase().includes(lowerQuery) ||
            p.description?.toLowerCase().includes(lowerQuery)
        );
        const filteredAvisos = allAvisos.filter(
          (a) =>
            a.title?.toLowerCase().includes(lowerQuery) ||
            a.description?.toLowerCase().includes(lowerQuery)
        );

        setProducts(filteredProducts);
        setAvisos(filteredAvisos);
      } catch (err) {
        console.error("Error buscando:", err);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: "center" }}
    >
      <Header /> {/* <-- agregado */}
      
      <Text style={styles.title}>Resultados para "{query}"</Text>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "products" && styles.activeTab]}
          onPress={() => setActiveTab("products")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "products" && styles.activeTabText,
            ]}
          >
            Productos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "avisos" && styles.activeTab]}
          onPress={() => setActiveTab("avisos")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "avisos" && styles.activeTabText,
            ]}
          >
            Avisos
          </Text>
        </TouchableOpacity>
      </View>
      {/* Productos */}
      {activeTab === "products" && products.length > 0 && (
        <View
          style={[
            styles.productsGrid,
            { maxWidth: isMobile ? "95vw" : "80vw" },
          ]}
        >
          {products.map((item) => (
            <Post
              key={item.id}
              title={item.title}
              images={item.images}
              description={item.description}
              savedCount={item.savedBy ? Object.keys(item.savedBy).length : 0}
              isSaved={!!item.savedBy?.[auth.currentUser?.uid]}
              onSave={() => {}}
              onPress={() =>
                navigation.navigate("DetailPost", {
                  postId: item.id,
                  tipo: "products",
                })
              }
            />
          ))}
        </View>
      )}
      {/* Avisos */}
      {activeTab === "avisos" && avisos.length > 0 && (
        <View style={styles.rowContainer}>
          {avisos.map((item) => (
            <View
              key={item.id}
              style={{
                marginBottom: 15,
                width: isMobile ? "95%" : "50%",
                alignSelf: "center",
              }}
            >
              <AvisoCard
                title={item.title}
                description={item.description}
                date={new Date(item.createdAt).toLocaleString()}
                savedCount={item.savedBy ? Object.keys(item.savedBy).length : 0}
                isSaved={!!item.savedBy?.[auth.currentUser?.uid]}
                onSave={() => {}}
                onPress={() =>
                  navigation.navigate("DetailPost", {
                    postId: item.id,
                    tipo: "avisos",
                  })
                }
              />
            </View>
          ))}
        </View>
      )}
      {/* Sin resultados */}
      {activeTab === "products" && products.length === 0 && (
        <Text style={styles.noResults}>No se encontraron productos.</Text>
      )}
      {activeTab === "avisos" && avisos.length === 0 && (
        <Text style={styles.noResults}>No se encontraron avisos.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0, // ⬅ sin espacio arriba
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingLeft: 10, // <-- agregado
    marginBottom: 15,
  },
  backText: {
    color: colors.primaryButton, // <-- mismo color que los botones/tabs
    fontWeight: "bold",
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 20,
    marginTop: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: { borderBottomColor: colors.primaryButton },
  tabText: { fontSize: 16, color: colors.textSecondary },
  activeTabText: { color: colors.primaryButton, fontWeight: "bold" },

  // Productos en grid responsivo
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
    marginBottom: 25,
  },

  rowContainer: { width: "100%", maxWidth: 1200, marginBottom: 25 },

  noResults: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default SearchResults;
