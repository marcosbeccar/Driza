import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import colors from "../styles/colors";

const TermsScreen = () => {
  const navigation = useNavigation();

  // 👉 Generar fecha en formato dd/mm/yyyy
  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${today.getFullYear()}`;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Términos y Condiciones</Text>
        <Text style={styles.updated}>Actualizado: {formattedDate}</Text>

        <Text style={styles.h2}>1. Aceptación de los Términos</Text>
        <Text style={styles.text}>
          El uso de la aplicación Driza implica la aceptación plena de los presentes Términos y Condiciones. 
          Si no está de acuerdo con alguno de los puntos, no use la aplicación.
        </Text>

        <Text style={styles.h2}>2. Uso de la Plataforma</Text>
        <Text style={styles.text}>
          Driza es una plataforma destinada a facilitar la compraventa de productos entre usuarios de una misma 
          comunidad (como universidades u organizaciones). Cada usuario es responsable de los productos que 
          publica y de la veracidad de la información que proporciona.
        </Text>

        <Text style={styles.h2}>3. Responsabilidad</Text>
        <Text style={styles.text}>
          Driza NO se hace responsable de las transacciones realizadas entre los usuarios, ni de los posibles 
          inconvenientes, pérdidas, daños o situaciones que puedan surgir como consecuencia de dichas transacciones. 
          La aplicación funciona únicamente como un medio de contacto entre compradores y vendedores.
        </Text>

        <Text style={styles.h2}>4. Recomendaciones de Seguridad</Text>
        <Text style={styles.text}>
          Para mayor seguridad, se recomienda que los encuentros para concretar transacciones se realicen en 
          lugares públicos y de preferencia dentro de la universidad u organización correspondiente. 
          Los usuarios son los únicos responsables de su seguridad y de la de sus pertenencias.
        </Text>

        <Text style={styles.h2}>5. Publicaciones</Text>
        <Text style={styles.text}>
          Queda prohibida la publicación de productos ilegales, peligrosos, falsificados o que vayan en contra 
          de las normativas de la comunidad. Driza se reserva el derecho de eliminar publicaciones que infrinjan 
          estas normas.
        </Text>

        <Text style={styles.h2}>6. Privacidad</Text>
        <Text style={styles.text}>
          La información personal de los usuarios será tratada con confidencialidad y utilizada únicamente 
          para el correcto funcionamiento de la plataforma.
        </Text>

        <Text style={styles.h2}>7. Contacto</Text>
        <Text style={styles.text}>
          Para consultas o reportes relacionados con la aplicación, los usuarios pueden comunicarse al correo:{" "}
          driza.compraventa@gmail.com
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  backButton: {
    marginBottom: 15,
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    color: colors.textPrimary,
  },
  updated: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  h2: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
    color: colors.textPrimary,
  },
  text: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default TermsScreen;
