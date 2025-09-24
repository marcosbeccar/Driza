// filepath: src/components/InlineLoader.js
import React from "react";
import { ActivityIndicator } from "react-native";

const InlineLoader = ({ size = "small", color = "dodgerblue" }) => {
  return <ActivityIndicator size={size} color={color} />;
};

export default InlineLoader;
