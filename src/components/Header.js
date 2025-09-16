// filepath: src/components/Header.js
import React from "react";
import { View, Image, StyleSheet, useWindowDimensions } from "react-native";
import colors from "../styles/colors";
import logo from "../../assets/logo.png";

const Header = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 500;

  return (
    <View style={[styles.container, { backgroundColor: colors.header }]}>
      <Image
        source={logo}
        style={[
          styles.logo,
          isMobile
            ? { alignSelf: "center", maxWidth: "70%" }
            : { marginLeft: 20, maxWidth: 300 },
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary,
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    height: 60, // mantiene la proporción del logo
  },
});

export default Header;
