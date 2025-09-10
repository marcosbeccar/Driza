// filepath: src/screens/CreateMenu.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import colors from "../styles/colors";
import { useNavigation } from "@react-navigation/native";

const CreateMenu = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear nueva publicación</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CreateProduct")}
      >
        <Text style={styles.buttonText}>Producto</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CreateAviso")}
      >
        <Text style={styles.buttonText}>Aviso</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    width: "80%",
    backgroundColor: colors.primaryButton,
    paddingVertical: 16,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default CreateMenu;
