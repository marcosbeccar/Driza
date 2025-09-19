// filepath: src/screens/CreateMenu.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import colors from "../styles/colors";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/Header"; 
import logo from "../../assets/Banner_chato.png"; 

const CreateMenu = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner grande */}
        <Image
          source={logo}
          style={styles.banner}
          resizeMode="contain"
        />

        <Text style={styles.title}>Crear nueva publicación</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Driza - Publicar producto")}
        >
          <Text style={styles.buttonText}>Producto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Driza - Publicar aviso")}
        >
          <Text style={styles.buttonText}>Aviso</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    alignItems: "center",
    padding: 20,
  },
  banner: {
    width: "85%",           // ancho por defecto
    maxWidth: 600,          // limita el tamaño en pantallas grandes
    height: 150,
    marginBottom: 30,
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
    maxWidth: 400,
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
