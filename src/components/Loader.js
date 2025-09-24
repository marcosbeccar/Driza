// filepath: src/components/Loader.js
import React, { useRef } from "react";
import { Easing, View, Animated } from "react-native";

const height = 50;

const Loader = ({ name = "6-dots", color = "dodgerblue" }) => {
  const firstCircle = useRef(new Animated.Value(0)).current;
  const secondCircle = useRef(new Animated.Value(0)).current;
  const thirdCircle = useRef(new Animated.Value(0)).current;
  const fourthCircle = useRef(new Animated.Value(0)).current;
  const fifthCircle = useRef(new Animated.Value(0)).current;
  const sixthCircle = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  let containerStyle = {};
  let backgroundStyle = {};
  let loaderStyle = {};

  const dotStyle = {
    width: 10,
    height: 10,
    backgroundColor: color,
    borderRadius: 6,
  };

  const transparentDot = {
    width: 10,
    height: 10,
    backgroundColor: "transparent",
    borderRadius: 6,
  };

  switch (name) {
    case "6-dots":
      containerStyle = {
        width: 100,
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      };

      Animated.loop(
        Animated.parallel([
          Animated.timing(firstCircle, {
            toValue: 120,
            duration: 2500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(secondCircle, {
            toValue: 120,
            duration: 2500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(thirdCircle, {
            toValue: 120,
            duration: 2500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(fourthCircle, {
            toValue: 120,
            duration: 2500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(fifthCircle, {
            toValue: 120,
            duration: 2500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(sixthCircle, {
            toValue: 120,
            duration: 2500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
      break;

    case "2-curves":
      containerStyle = {
        height: 48,
        width: 48,
      };
      backgroundStyle = {
        height: "100%",
        width: "100%",
        borderRadius: height,
        backgroundColor: "transparent",
      };
      loaderStyle = {
        position: "absolute",
        height: "100%",
        width: "100%",
        borderRadius: height,
        borderWidth: 5,
        backgroundColor: "transparent",
        borderTopColor: color,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: color,
      };
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 360,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
      break;

    default:
      break;
  }

  if (name === "2-curves") {
    return (
      <View style={containerStyle}>
        <View style={backgroundStyle}></View>
        <Animated.View
          style={[
            loaderStyle,
            {
              transform: [
                {
                  rotateZ: rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    );
  }

  if (name === "6-dots") {
    return (
      <View style={containerStyle}>
        <Animated.View
          style={[
            dotStyle,
            {
              transform: [
                {
                  translateX: firstCircle.interpolate({
                    inputRange: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
                    outputRange: [0, 15, 30, 45, 60, 75, 90, 75, 60, 45, 30, 15, 0],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            dotStyle,
            {
              transform: [
                {
                  translateY: secondCircle.interpolate({
                    inputRange: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
                    outputRange: [0, -15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            dotStyle,
            {
              transform: [
                {
                  translateY: thirdCircle.interpolate({
                    inputRange: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
                    outputRange: [0, 0, -15, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            dotStyle,
            {
              transform: [
                {
                  translateY: fourthCircle.interpolate({
                    inputRange: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
                    outputRange: [0, 0, 0, -15, 0, 0, 0, 0, 0, 15, 0, 0, 0],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            dotStyle,
            {
              transform: [
                {
                  translateY: fifthCircle.interpolate({
                    inputRange: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
                    outputRange: [0, 0, 0, 0, -15, 0, 0, 0, 15, 0, 0, 0, 0],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            dotStyle,
            {
              transform: [
                {
                  translateY: sixthCircle.interpolate({
                    inputRange: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
                    outputRange: [0, 0, 0, 0, 0, -15, 0, 15, 0, 0, 0, 0, 0],
                  }),
                },
              ],
            },
          ]}
        />
        <View style={transparentDot}></View>
      </View>
    );
  }

  return null;
};

export default Loader;
