import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, db } from "../firebase/config";
import colors from "../styles/colors";
import { useNavigation } from "@react-navigation/native"; // Importa useNavigation

const AuthScreen = () => {
  const [termsAccepted, setTermsAccepted] = useState(false); // Estado para los términos
  const navigation = useNavigation(); // Inicializa la navegación
  const redirectUri = AuthSession.makeRedirectUri({
    native: "com.driza.app:/oauthredirect",
    useProxy: Platform.OS !== "web",
  });

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "271157129829-njsv8phcv3jdae0ddqpl99cvra6svroe.apps.googleusercontent.com",
    iosClientId: "51829864704-ul8m3am1hn8q50q789ehak0cjfka6vso.apps.googleusercontent.com",
    androidClientId: "51829864704-5q2pee27emq84r1ghrorj0oeu0hp8uts.apps.googleusercontent.com",
    redirectUri,
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

          const userRef = ref(db, `users/${userId}`);
          const snapshot = await get(userRef);

          if (!snapshot.exists()) {
            const esUDESA = user.email.endsWith("@udesa.edu.ar");

            await set(userRef, {
              email: user.email,
              userName: user.displayName,
              savedPosts: {},
              esUDESA: esUDESA,
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

      {/* Checkbox para aceptar términos */}
      <TouchableOpacity
        style={styles.termsContainer}
        onPress={() => setTermsAccepted(!termsAccepted)}
      >
        <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]} />
        <Text style={styles.termsText}>
          Acepto los{" "}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("TermsScreen")} // Navega a TermsScreen
          >
            Términos y Condiciones
          </Text>
        </Text>
      </TouchableOpacity>

      {/* Botón de Google */}
      <TouchableOpacity
        style={[
          styles.button,
          !termsAccepted && styles.buttonDisabled, // Cambia el estilo si no se aceptaron los términos
        ]}
        onPress={() => promptAsync()}
        disabled={!request || !termsAccepted} // Deshabilita si no se aceptaron los términos
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
