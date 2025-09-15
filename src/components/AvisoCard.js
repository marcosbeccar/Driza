// filepath: src/components/AvisoCard.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import colors from "../styles/colors";

const AvisoCard = ({
  title,
  description,
  date,
  savedCount = 0,
  isSaved = false,
  onSave,
  onPress,
}) => {
  const [windowWidth, setWindowWidth] = useState(Dimensions.get("window").width);

  useEffect(() => {
    const handleResize = ({ window }) => {
      setWindowWidth(window.width);
    };

    const subscription = Dimensions.addEventListener("change", handleResize);

    return () => {
      subscription?.remove?.();
    };
  }, []);

  // ancho de la card: 50vw si >=500px, 90vw si <500px
  const cardWidth = windowWidth < 500 ? "90vw" : "50vw";

  return (
    <TouchableOpacity style={[styles.card, { width: cardWidth }]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={7}>
          {description}
        </Text>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.savedCount}>
          Guardado por {savedCount} usuario/s
        </Text>
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
  iconButton: { padding: 4, alignSelf: "flex-start" },
});

export default AvisoCard;
