import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { auth } from "./src/firebase/config";
import { View, Text } from "react-native";
import * as Font from "expo-font";


import AuthScreen from "./src/screens/AuthScreen";
import TabNavigator from "./src/components/TabNavigator";
import TermsScreen from "./src/screens/TermsScreen";
import SearchResults from "./src/screens/SearchResults";

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // 🔤 Cargar fonts de @expo/vector-icons
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        FontAwesome: require("./assets/fonts/FontAwesome.ttf"),
        Ionicons: require("./assets/fonts/Ionicons.ttf"),
        MaterialIcons: require("./assets/fonts/MaterialIcons.ttf"),
        MaterialCommunityIcons: require("./assets/fonts/MaterialCommunityIcons.ttf"),
        AntDesign: require("./assets/fonts/AntDesign.ttf"),
        Entypo: require("./assets/fonts/Entypo.ttf"),
        Feather: require("./assets/fonts/Feather.ttf"),
        EvilIcons: require("./assets/fonts/EvilIcons.ttf"),
        Fontisto: require("./assets/fonts/Fontisto.ttf"),
        Foundation: require("./assets/fonts/Foundation.ttf"),
        Octicons: require("./assets/fonts/Octicons.ttf"),
        SimpleLineIcons: require("./assets/fonts/SimpleLineIcons.ttf"),
        Zocial: require("./assets/fonts/Zocial.ttf")
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  // 🔄 Estado de autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="TermsScreen" component={TermsScreen} />
          </>
        ) : (
          <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="SearchResults" component={SearchResults} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
