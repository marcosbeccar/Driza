// filepath: src/screens/AuthScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native-web";
import {
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, db } from "../firebase/config";
import colors from "../styles/colors";
import { useNavigation } from "@react-navigation/native";
import Loader from "../components/Loader"; // 👈 importamos tu loader

const AuthScreen = () => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigation = useNavigation();

  // 🔹 Escuchar estado de auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true); // activa loader al iniciar chequeo
      if (user) {
        const allowed = await handleUser(user);
        if (!allowed) {
          setLoading(false);
          return;
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 🔹 Manejar login Google con popup
  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await setPersistence(auth, browserLocalPersistence);

      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const allowed = await handleUser(result.user);
        if (!allowed) {
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error("❌ Error al iniciar sesión con Google:", error);
      setErrorMessage("Error al iniciar sesión, intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Registrar usuario en DB si no existe y verificar baneados
  const handleUser = async (user) => {
    if (!user) return false;

    try {
      // Verificar si el email está baneado
      const bannedRef = ref(db, `baneados/${user.email.replace(/\./g, "_")}`);
      const bannedSnap = await get(bannedRef);

      if (bannedSnap.exists() && bannedSnap.val()?.banned) {
        console.warn("🚫 Usuario baneado intentó iniciar sesión:", user.email);
        await signOut(auth); // cerrar sesión
        setErrorMessage("Tu cuenta ha sido baneada y no puedes iniciar sesión.");
        return false;
      }

      // Si no está baneado, crear usuario en DB si no existe
      const userRef = ref(db, `users/${user.uid}`);
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

      return true;
    } catch (err) {
      console.error("❌ Error en handleUser:", err);
      setErrorMessage("Hubo un problema al procesar tu cuenta.");
      return false;
    }
  };

  // 🔹 Loader mientras se inicializa / procesa
  if (loading) {
    return <Loader message="Iniciando sesión..." />; // 👈 usamos tu Loader
  }

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require("../../assets/Banner_chato.png")} style={styles.logo} />

      <Text style={styles.title}>
        Comprá y vendé dentro de tu comunidad. En Driza es fácil y seguro.
      </Text>

      <Text style={styles.subtitle}>
        Iniciá sesión o registrate con tu cuenta de Google
      </Text>

      {errorMessage ? (
        <Text style={[styles.message, styles.error]}>{errorMessage}</Text>
      ) : null}

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
  logo: {
    height: 120,
    marginBottom: 15,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.verde,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 30,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  error: { color: "red" },
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
    maxWidth: 1000,
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
