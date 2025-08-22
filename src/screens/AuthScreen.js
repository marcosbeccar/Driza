import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, db } from "../firebase/config";
import colors from "../styles/colors";

const AuthScreen = () => {
  // 👇 Definimos el redirectUri dinámico
  const redirectUri = AuthSession.makeRedirectUri({
  native: "com.driza.app:/oauthredirect",
  useProxy: Platform.OS !== "web",
  });


  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "51829864704-l41c2kuiaht92friktitcod1hv4mui5u.apps.googleusercontent.com",
    iosClientId: "51829864704-ul8m3am1hn8q50q789ehak0cjfka6vso.apps.googleusercontent.com",
    androidClientId: "51829864704-5q2pee27emq84r1ghrorj0oeu0hp8uts.apps.googleusercontent.com",
    redirectUri, // 👈 usamos la variable que armamos
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const userId = user.uid;

          console.log("✅ Usuario autenticado:", user.email);

          // Revisar si ya existe el usuario en la DB
          const userRef = ref(db, `users/${userId}`);
          const snapshot = await get(userRef);

          if (!snapshot.exists()) {
            // Si no existe → lo creamos con estructura inicial
            const esUDESA = user.email.endsWith("@udesa.edu.ar");

            await set(userRef, {
              email: user.email,
              userName: user.displayName,
              savedPosts: {}, // espacio vacío para posteos guardados
              esUDESA: esUDESA, // flag de dominio
            });

            console.log("📌 Usuario creado en la DB con estructura inicial.");
          } else {
            console.log("ℹ️ Usuario ya existía en la DB, no se sobrescribió.");
          }
        })
        .catch((error) => {
          console.error("❌ Error al iniciar sesión con Google:", error);
        });
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>
        Inicia sesión o regístrate con tu cuenta de Google
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => promptAsync()}
        disabled={!request}
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
  button: {
    backgroundColor: colors.primaryButton,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AuthScreen;
