import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { auth } from "./src/firebase/config";
import { View, Text } from "react-native";

import AuthScreen from "./src/screens/AuthScreen";
import TabNavigator from "./src/components/TabNavigator";

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Nuevo estado para manejar la carga inicial

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false); // Deja de cargar una vez que se verifica el estado del usuario
    });
    return unsubscribe;
  }, []);

  if (loading) {
    // Mientras se verifica el estado del usuario, muestra una pantalla de carga
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Loading" component={LoadingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <Stack.Screen name="Main" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Pantalla de carga mientras se verifica el estado del usuario
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Cargando...</Text>
  </View>
);
