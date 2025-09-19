// filepath: src/screens/AuthScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native-web";
import {
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, db } from "../firebase/config";
import colors from "../styles/colors";
import { useNavigation } from "@react-navigation/native";

const AuthScreen = () => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // 🔹 Escuchar estado de auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) await handleUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 🔹 Manejar login Google con popup
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await setPersistence(auth, browserLocalPersistence);

      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await handleUser(result.user);
      }
    } catch (error) {
      console.error("❌ Error al iniciar sesión con Google:", error);
    }
  };

  // 🔹 Registrar usuario en DB si no existe
  const handleUser = async (user) => {
    if (!user) return;
    const userId = user.uid;

    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      let organizacion = "NO";
      if (user.email.endsWith("@udesa.edu.ar")) {
        organizacion = "UDESA";
      }

      await set(userRef, {
        email: user.email,
        userName: user.displayName,
        savedPosts: {},
        organizacion,
      });

      console.log("📌 Usuario creado en DB con organización:", organizacion);
    } else {
      console.log("ℹ️ Usuario ya existía en DB, no se sobrescribió.");
    }
  };

  // 🔹 Loader mientras se inicializa
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primaryButton} />
        <Text style={styles.loaderText}>Iniciando sesión...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require("../../assets/Banner_chato.png")} style={styles.logo} />

      <Text style={styles.title}>
        Compra y vende dentro de tu comunidad. En Driza es fácil y seguro.
      </Text>

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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  logo: {
    height: 80,
    marginBottom: 15,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.textPrimary,
    textAlign: "center",
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
