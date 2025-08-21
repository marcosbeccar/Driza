import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth, db } from "../firebase/config";
import colors from "../styles/colors";

const AuthScreen = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "94304624728-2bmmqt8thosah5s720pgc60pbstmf1cp.apps.googleusercontent.com",
    iosClientId: "94304624728-2bmmqt8thosah5s720pgc60pbstmf1cp.apps.googleusercontent.com",
    androidClientId: "94304624728-2bmmqt8thosah5s720pgc60pbstmf1cp.apps.googleusercontent.com",
    redirectUri: AuthSession.makeRedirectUri({
      useProxy: process.env.NODE_ENV !== "production",
    }),
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then((userCredential) => {
          const user = userCredential.user;
          const userId = user.uid;

          console.log("✅ Usuario autenticado:", user.email);

          // Guardar datos en Firebase Realtime Database
          db.ref(`users/${userId}`).set({
            email: user.email,
            userName: user.displayName,
          });
        })
        .catch((error) => {
          console.error("Error al iniciar sesión con Google:", JSON.stringify(error, null, 2));
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
