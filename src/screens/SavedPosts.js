// filepath: src/screens/SavedPosts.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { db, auth } from "../firebase/config";
import { ref, onValue, get, update } from "firebase/database";
import Post from "../components/Post";
import AvisoCard from "../components/AvisoCard";
import colors from "../styles/colors";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../components/Header";

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
      style={{ position: "relative", marginBottom: 20 }}
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
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const SavedPosts = () => {
  const [savedProducts, setSavedProducts] = useState([]);
  const [savedAvisos, setSavedAvisos] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width
  );
  const navigation = useNavigation();

  useEffect(() => {
    const handleResize = ({ window }) => setWindowWidth(window.width);
    const subscription = Dimensions.addEventListener("change", handleResize);
    return () => subscription?.remove?.();
  }, []);

  const isMobile = windowWidth < 500;

  useEffect(() => {
    const userId = auth.currentUser.uid;
    const savedRef = ref(db, `users/${userId}/savedPosts`);

    const unsubscribe = onValue(savedRef, async (snapshot) => {
      const savedData = snapshot.val() || {};
      const productos = [];
      const avisos = [];

      for (const [postId, tipo] of Object.entries(savedData)) {
        const postRef = ref(db, `${tipo}/${postId}`);
        const postSnap = await get(postRef);
        if (postSnap.exists()) {
          const post = { id: postId, tipo, ...postSnap.val() };
          if (tipo === "products") productos.push(post);
          else if (tipo === "avisos") avisos.push(post);
        }
      }

      setSavedProducts(productos);
      setSavedAvisos(avisos);
    });

    return () => unsubscribe();
  }, []);

  const toggleSave = async (postId, tipo) => {
    try {
      const userId = auth.currentUser.uid;
      const postRef = ref(db, `${tipo}/${postId}`);
      const snapshot = await get(postRef);
      if (!snapshot.exists()) return;

      const postData = snapshot.val();
      const savedBy = postData.savedBy || {};

      if (savedBy[userId]) {
        delete savedBy[userId];
        await update(ref(db, `users/${userId}/savedPosts`), {
          [postId]: null,
        });
      } else {
        savedBy[userId] = true;
        await update(ref(db, `users/${userId}/savedPosts`), {
          [postId]: tipo,
        });
      }

      await update(postRef, { savedBy });
    } catch (err) {
      console.error("Error al guardar/desguardar:", err);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: "center" }}
    >
      <Header />
      <Text style={styles.title}>Posts Guardados</Text>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "products" && styles.activeTab]}
          onPress={() => setActiveTab("products")}
        >
          <Text
            style={[styles.tabText, activeTab === "products" && styles.activeTabText]}
          >
            Productos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "avisos" && styles.activeTab]}
          onPress={() => setActiveTab("avisos")}
        >
          <Text
            style={[styles.tabText, activeTab === "avisos" && styles.activeTabText]}
          >
            Avisos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Productos */}
      {activeTab === "products" &&
        (savedProducts.length > 0 ? (
          <View style={styles.rowContainer}>
            <HorizontalRow
              data={savedProducts}
              onSave={toggleSave}
              onPressItem={(item) =>
                navigation.navigate("Driza - Detalle publicacion", {
                  postId: item.id,
                  tipo: "products",
                })
              }
              isMobile={isMobile}
            />
          </View>
        ) : (
          <Text style={styles.emptyText}>No guardaste ninguna publicación</Text>
        ))}

      {/* Avisos */}
      {activeTab === "avisos" &&
        (savedAvisos.length > 0 ? (
          <View style={styles.rowContainer}>
            {savedAvisos.map((item) => (
              <View key={item.id} style={styles.avisoCardWrapper}>
                <AvisoCard
                  title={item.title}
                  description={item.description}
                  date={new Date(item.createdAt).toLocaleString()}
                  savedCount={item.savedBy ? Object.keys(item.savedBy).length : 0}
                  isSaved={!!item.savedBy?.[auth.currentUser.uid]}
                  onSave={() => toggleSave(item.id, item.tipo)}
                  onPress={() =>
                    navigation.navigate("Driza - Detalle publicacion", {
                      postId: item.id,
                      tipo: "avisos",
                    })
                  }
                />
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No guardaste ninguna publicación</Text>
        ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
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
  activeTab: {
    borderBottomColor: "#962A51",
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: "#962A51",
    fontWeight: "bold",
  },
  rowContainer: {
    width: "100%",
    maxWidth: "80vw",
    marginBottom: 25,
  },
  avisoCardWrapper: {
    marginBottom: 12,
    width: "95%",
    alignSelf: "center",
  },
  scrollButton: {
    position: "absolute",
    top: "35%",
    width: 28,
    height: 28,
    backgroundColor: "rgba(150,42,81,0.85)",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginVertical: 30,
  },
});

export default SavedPosts;
