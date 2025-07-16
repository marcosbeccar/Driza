import React, { Component } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { auth } from "../firebase/config";

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      errorMSG: "",
    };
  }

  handleSubmit = () => {
    const { email, password } = this.state;

    if (!email.endsWith("@udesa.edu.ar")) {
      this.setState({ errorMSG: "Debes usar un email de la universidad (@udesa.edu.ar)" });
      return;
    }

    if (password.length < 6) {
      this.setState({ errorMSG: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }

    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ errorMSG: "" });
        this.props.navigation.navigate("Home");
      })
      .catch(() => {
        this.setState({ errorMSG: "Credenciales incorrectas" });
      });
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Iniciar Sesión</Text>

        <TextInput
          style={styles.input}
          keyboardType="email-address"
          placeholder="Email"
          onChangeText={(text) => this.setState({ email: text })}
          value={this.state.email}
        />
        <TextInput
          style={styles.input}
          keyboardType="default"
          placeholder="Contraseña"
          secureTextEntry={true}
          onChangeText={(text) => this.setState({ password: text })}
          value={this.state.password}
        />

        <TouchableOpacity style={styles.button} onPress={this.handleSubmit}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        {this.state.errorMSG && <Text style={styles.errorText}>{this.state.errorMSG}</Text>}

        <Text style={styles.registerText}>¿No tienes una cuenta? <Text onPress={() => this.props.navigation.navigate("Register")} style={styles.link}>Regístrate</Text></Text>
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
    backgroundColor: "#2373FA",
    paddingVertical: 10,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#E7F5F3",
    fontSize: 20,
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
  registerText: {
    marginTop: 20,
    fontSize: 16,
  },
  link: {
    color: "#2373FA",
    fontWeight: "bold",
  },
});