import React, { Component } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { db, auth } from "../firebase/config";

export default class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      userName: "",
      errorMSG: "",
    };
  }

  handleSubmit = () => {
    const { email, password, userName } = this.state;

    if (!email.endsWith("@udesa.edu.ar")) {
      this.setState({ errorMSG: "Debes usar un email de la universidad (@udesa.edu.ar)" });
      return;
    }

    if (password.length < 6) {
      this.setState({ errorMSG: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const userId = userCredential.user.uid;
        // Crea el usuario en la rama "users" con su UID como clave
        db.ref(`users/${userId}`).set({
          email: email,
          userName: userName,
          savedPosts: {} // Inicializa vacío
        }).then(() => {
          console.log('Usuario guardado en users');
        });
        userCredential.user.sendEmailVerification()
          .then(() => {
            this.setState({ errorMSG: "" });
            this.props.navigation.navigate("VerifyEmail");
          });
      })
      .catch((error) => {
        this.setState({ errorMSG: error.message });
      });
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Registrate</Text>

        <TextInput
          style={styles.input}
          keyboardType="email-address"
          placeholder="Email"
          onChangeText={(text) => this.setState({ email: text })}
          value={this.state.email}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry={true}
          onChangeText={(text) => this.setState({ password: text })}
          value={this.state.password}
        />
        <TextInput
          style={styles.input}
          placeholder="Nombre de usuario"
          onChangeText={(text) => this.setState({ userName: text })}
          value={this.state.userName}
        />

        <TouchableOpacity style={styles.button} onPress={this.handleSubmit}>
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>

        {this.state.errorMSG && <Text style={styles.errorText}>{this.state.errorMSG}</Text>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#c3e6fa",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ced4da",
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: "100%",
    backgroundColor: "#F5FBFD",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
});