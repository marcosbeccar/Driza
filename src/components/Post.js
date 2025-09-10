import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import colors from "../styles/colors";

const Post = ({
  title,
  images = [],
  description,
  savedCount = 0,
  isSaved = false,
  onSave,
  onPress,
}) => {
  const portada = images?.[0];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {portada ? (
        <Image source={{ uri: portada }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.noImageText}>Sin imagen</Text>
        </View>
      )}

      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        <Text style={styles.savedCount}>
          Guardado por {savedCount} usuario/s
        </Text>

        {onSave && (
          <TouchableOpacity
            style={[styles.saveButton, isSaved ? styles.saved : styles.notSaved]}
            onPress={onSave}
          >
            <Text style={styles.saveButtonText}>{isSaved ? "Desguardar" : "Guardar"}</Text>
          </TouchableOpacity>
        )}
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
  image: { width: "100%", height: 120, borderRadius: 8 },
  imagePlaceholder: {
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: { color: colors.textSecondary, fontSize: 14 },
  textContainer: { padding: 8 },
  title: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  description: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  savedCount: { fontSize: 12, color: "#228bfa", marginBottom: 4 },
  saveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  saved: { backgroundColor: "#e74c3c" },
  notSaved: { backgroundColor: colors.primaryButton },
  saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});

export default Post;
