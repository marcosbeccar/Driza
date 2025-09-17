// filepath: src/components/AvisoCard.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FontAwesome } from "@expo/vector-icons"; 
import colors from "../styles/colors";

const AvisoCard = ({
  title,
  description,
  date,
  savedCount = 0,
  isSaved = false,
  organizacion = "NO",
  onSave,
  onPress,
}) => {
  const [windowWidth, setWindowWidth] = useState(Dimensions.get("window").width);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const handleResize = ({ window }) => {
      setWindowWidth(window.width);
    };
    const subscription = Dimensions.addEventListener("change", handleResize);
    return () => {
      subscription?.remove?.();
    };
  }, []);

  const cardWidth = windowWidth < 500 ? "90vw" : "50vw";

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={7}>
          {description}
        </Text>
        <Text style={styles.date}>{date}</Text>

        {/* fila inferior con guardados + advertencia */}
        <View style={styles.bottomRow}>
          <Text style={styles.savedCount}>
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
                    El autor de este aviso no pertenece a la organización
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {onSave && (
        <TouchableOpacity onPress={onSave} style={styles.iconButton}>
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={24}
            color={isSaved ? "#05383a" : colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  savedCount: {
    fontSize: 12,
    color: "#228bfa",
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  iconButton: { padding: 4, alignSelf: "flex-start" },
  warningIcon: { marginLeft: 8 },
  tooltip: {
    position: "absolute",
    bottom: "120%",
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

export default AvisoCard;
