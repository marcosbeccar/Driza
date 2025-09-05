import React from "react";
import { View, Text, Image, Button, TouchableOpacity, StyleSheet } from "react-native";
import colors from "../styles/colors";

const Post = ({
  title,
  images = [],
  description,
  savedCount = 0,
  onSave,
  onBuy,
  onPress,
}) => {
  const portada = images?.[0]; // mostrar solo la primera imagen como portada

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {portada && <Image source={{ uri: portada }} style={styles.image} />}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        <Text style={styles.savedCount}>Guardado por {savedCount} usuario/s</Text>
        {onSave && <Button title="Guardar" onPress={onSave} />}
        {onBuy && <Button title="Buy" onPress={onBuy} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginRight: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: 200,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 120,
  },
  textContainer: {
    padding: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  savedCount: {
    fontSize: 12,
    color: "#228bfa",
    marginBottom: 4,
  },
});

export default Post;
