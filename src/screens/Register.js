import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { auth } from "../firebase/config";
import colors from "../styles/colors";

const Register = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [errorMSG, setErrorMSG] = useState("");

  const handleRegister = () => {
    if (!email.endsWith("@udesa.edu.ar")) {
      setErrorMSG("Debes usar un email de la universidad (@udesa.edu.ar)");
      return;
    }

    if (password.length < 6) {
      setErrorMSG("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    auth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const userId = userCredential.user.uid;
        // Crea el usuario en la rama "users" con su UID como clave
        db.ref(`users/${userId}`)
          .set({
            email: email,
            userName: userName,
            savedPosts: {}, // Inicializa vacío
          })
          .then(() => {
            console.log("Usuario guardado en users");
          });
        userCredential.user.sendEmailVerification().then(() => {
          setErrorMSG("");
          navigation.navigate("Login");
        });
      })
      .catch((error) => {
        setErrorMSG(error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrate</Text>

      <TextInput
        style={styles.input}
        keyboardType="email-address"
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry={true}
        onChangeText={setPassword}
        value={password}
      />
      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        onChangeText={setUserName}
        value={userName}
      />

      {errorMSG !== "" && <Text style={styles.errorText}>{errorMSG}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>

      <Text style={styles.question}>¿Ya tenés una cuenta?</Text>
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Volver al Login</Text>
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.textPrimary,
  },
  input: {
    height: 50,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: "100%",
    backgroundColor: "#F5FBFD",
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
  button: {
    backgroundColor: colors.primaryButton,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: colors.secondaryButton,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  question: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
    color: colors.textSecondary,
  },
});

export default Register;
