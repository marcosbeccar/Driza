// filepath: src/components/Post.js
import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FontAwesome } from "@expo/vector-icons"; 
import colors from "../styles/colors";

const Post = ({
  title,
  images = [],
  description,
  savedCount = 0,
  isSaved = false,
  organizacion = "NO",
  onSave,
  onPress,
}) => {
  const [windowWidth, setWindowWidth] = useState(Dimensions.get("window").width);
  const [showTooltip, setShowTooltip] = useState(false); // <--- para tooltip

  useEffect(() => {
    const handleResize = ({ window }) => setWindowWidth(window.width);
    const subscription = Dimensions.addEventListener("change", handleResize);
    return () => subscription?.remove?.();
  }, []);

  const isMobile = windowWidth < 500;
  const cardWidth = isMobile ? 120 : 350;
  const cardHeight = isMobile ? 220 : 140;
  const portada = images?.[0];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isMobile ? styles.mobileContainer : styles.desktopContainer,
        { width: cardWidth, height: cardHeight },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {portada ? (
        <Image
          source={{ uri: portada }}
          style={isMobile ? styles.mobileImage : styles.desktopImage}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            isMobile ? styles.mobileImage : styles.desktopImage,
            styles.imagePlaceholder,
          ]}
        >
          <Text style={styles.noImageText}>Sin imagen</Text>
        </View>
      )}

      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, isMobile && styles.mobileTitle]}
            numberOfLines={2}
          >
            {title}
          </Text>
          {onSave && (
            <TouchableOpacity onPress={onSave} style={styles.iconButtonMobile}>
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={isMobile ? 18 : 20}
                color={isSaved ? "#05383a" : colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        <Text
          style={[styles.description, isMobile && styles.mobileDescription]}
          numberOfLines={2}
        >
          {description}
        </Text>

        {/* fila inferior con guardados + advertencia */}
        <View style={styles.bottomRow}>
          <Text
            style={[styles.savedCount, isMobile && styles.mobileSavedCount]}
          >
            Guardado por {savedCount} usuario/s
          </Text>

          {organizacion === "NO" && (
            <View
              style={{ position: "relative" }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <FontAwesome
                name="exclamation-triangle"
                size={14}
                color="red"
                style={styles.warningIcon}
              />
              {showTooltip && (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>
                    El autor de este producto no pertenece a la organización
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
    alignSelf: "center",
  },
  desktopContainer: { flexDirection: "row" },
  mobileContainer: { flexDirection: "column" },
  desktopImage: { width: 120, height: 120, borderRadius: 8, margin: 8 },
  mobileImage: { width: "100%", height: 120, borderRadius: 8, marginBottom: 6 },
  imagePlaceholder: {
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: { color: colors.textSecondary, fontSize: 14 },
  textContainer: { flex: 1, paddingHorizontal: 6, justifyContent: "center" },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    flexShrink: 1,
  },
  mobileTitle: { fontSize: 14, flex: 1 },
  description: { fontSize: 14, color: colors.textSecondary },
  mobileDescription: { fontSize: 12, marginTop: 2 },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  savedCount: { fontSize: 12, color: "#228bfa" },
  mobileSavedCount: { fontSize: 10 },
  iconButtonMobile: { marginLeft: 6, alignSelf: "center" },
  warningIcon: { marginLeft: 8 },
  tooltip: {
    position: "absolute",
    bottom: "120%", // aparece arriba del ícono
    right: 0,
    backgroundColor: "#333",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    maxWidth: 200,
    zIndex: 1000,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 12,
  },
});

export default Post;
