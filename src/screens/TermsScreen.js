import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import colors from "../styles/colors";

const TermsScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Términos y Condiciones</Text>
        <Text style={styles.text}>
          Aquí puedes incluir los términos y condiciones de tu aplicación. Asegúrate de detallar cómo se manejarán los datos de los usuarios, las políticas de privacidad, y cualquier otra información relevante.
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.textPrimary,
  },
  text: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
});

export default TermsScreen;

