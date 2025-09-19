// filepath: src/components/Header.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Text,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import colors from "../styles/colors";
import logo from "../../assets/Banner_ByN.png";

const Header = () => {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();
  const animation = useRef(new Animated.Value(0)).current;

  const windowWidth = Dimensions.get("window").width;
  const isMobile = windowWidth < 500;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: menuOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const menuHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  const handleSearch = () => {
    if (query.trim().length > 0) {
      navigation.navigate("Driza - Resultados de busqueda", { query });
      setQuery("");
    }
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
    setMenuOpen(false);
  };

  return (
    <View style={styles.header}>
      {/* Botón menú */}
      <View style={styles.menuContainer}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <FontAwesome name="bars" size={24} color={colors.background} />
        </TouchableOpacity>

        {/* Dropdown animado */}
        <Animated.View
          style={[
            styles.dropdown,
            { height: menuHeight, opacity: animation },
          ]}
        >
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => handleNavigate("recomendaciones")}
          >
            <Text style={styles.dropdownText}>Recomendaciones</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => handleNavigate("infoPromo")}
          >
            <Text style={styles.dropdownText}>
              Quiero promocionar mi publicación
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Logo */}
      <TouchableOpacity onPress={() => navigation.navigate("Driza")}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </TouchableOpacity>

      {/* Barra de búsqueda */}
      <View
        style={[
          styles.searchContainer,
          !isMobile && { marginLeft: "auto", marginRight: 10 }, // PC: a la derecha
          isMobile && { maxWidth: "60%" }, // Mobile
        ]}
      >
        <TextInput
          style={styles.searchInput}
          placeholder={isMobile ? "Buscar..." : "Buscar avisos o productos..."}
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {!isMobile && (
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <FontAwesome name="search" size={20} color={colors.background} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    backgroundColor: colors.header,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
    zIndex: 999,
  },
  menuContainer: {
    position: "relative",
    marginRight: 10,
    zIndex: 1000,
  },
  menuButton: {
    padding: 6,
    backgroundColor: colors.primaryButton,
    borderRadius: 6,
  },
  dropdown: {
    position: "absolute",
    top: 40,
    left: 0,
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  logo: {
    height: 40,
    width: 100,
    marginRight: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 8,
    flex: 1,
    maxWidth: 350,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  searchButton: {
    backgroundColor: colors.primaryButton,
    padding: 8,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Header;
