// filepath: src/components/Header.js
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import colors from "../styles/colors";
import logo from "../../assets/Banner_ByN.png";

const Header = () => {
  const [query, setQuery] = useState("");
  const navigation = useNavigation();
  const windowWidth = Dimensions.get("window").width;
  const isMobile = windowWidth < 500;

  const handleSearch = () => {
    if (query.trim().length > 0) {
      navigation.navigate("SearchResults", { query });
      setQuery("");
    }
  };

  return (
    <View style={styles.header}>
      {/* Logo siempre a la izquierda */}
      <Image
        source={logo}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Barra de búsqueda */}
      <View
        style={[
          styles.searchContainer,
          isMobile
            ? { marginLeft: 10, flex: 1 } // mobile ocupa el resto
            : { marginLeft: 20, flex: 1 }, // desktop ocupa todo a la derecha del logo
        ]}
      >
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar avisos o productos..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color={colors.background} />
        </TouchableOpacity>
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
    justifyContent: "space-between", // <--- aquí cambia
  },
  logo: {
    height: 40,
    width: 100,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 8,
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
