import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native-web";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, db } from "../firebase/config";
import colors from "../styles/colors";
import { useNavigation } from "@react-navigation/native";

const AuthScreen = () => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigation = useNavigation();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userId = user.uid;

      console.log("✅ Usuario autenticado:", user.email);

      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        // 🔄 Determinar organización según el email
        let organizacion = "NO";
        if (user.email.endsWith("@udesa.edu.ar")) {
          organizacion = "UDESA";
        }
        // Aquí más reglas si quieres agregar más organizaciones
        // else if (user.email.endsWith("@itba.edu.ar")) organizacion = "ITBA";

        await set(userRef, {
          email: user.email,
          userName: user.displayName,
          savedPosts: {},
          organizacion: organizacion,
        });

        console.log("📌 Usuario creado en la DB con organización:", organizacion);
      } else {
        console.log("ℹ️ Usuario ya existía en la DB, no se sobrescribió.");
      }
    } catch (error) {
      console.error("❌ Error al iniciar sesión con Google:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>
        Inicia sesión o regístrate con tu cuenta de Google
      </Text>

      {/* Checkbox términos */}
      <TouchableOpacity
        style={styles.termsContainer}
        onPress={() => setTermsAccepted(!termsAccepted)}
      >
        <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]} />
        <Text style={styles.termsText}>
          Acepto los{" "}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("TermsScreen")}
          >
            Términos y Condiciones
          </Text>
        </Text>
      </TouchableOpacity>

      {/* Botón Google */}
      <TouchableOpacity
        style={[styles.button, !termsAccepted && styles.buttonDisabled]}
        onPress={handleGoogleLogin}
        disabled={!termsAccepted}
      >
        <Text style={styles.buttonText}>Continuar con Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 30,
    textAlign: "center",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    borderRadius: 4,
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: colors.primaryButton,
  },
  termsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  link: {
    color: colors.primaryButton,
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: colors.primaryButton,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AuthScreen;
