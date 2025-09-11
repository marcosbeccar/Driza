// filepath: src/components/Post.js
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
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
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
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
          <TouchableOpacity onPress={onSave} style={styles.iconButton}>
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isSaved ? "#05383a" : colors.textSecondary}
            />
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
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    overflow: "hidden",
  },
  image: { width: 120, height: 120, borderRadius: 8, margin: 8 },
  imagePlaceholder: {
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: { color: colors.textSecondary, fontSize: 14 },
  textContainer: { flex: 1, padding: 8, justifyContent: "center" },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  savedCount: { fontSize: 12, color: "#228bfa", marginBottom: 8 },
  iconButton: { padding: 4, alignSelf: "flex-start" },
});

export default Post;
