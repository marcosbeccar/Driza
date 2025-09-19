// filepath: src/components/TabNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome } from "@expo/vector-icons";
import { auth } from "../firebase/config";

import MainPage from "../screens/MainPage";
import Profile from "../screens/Profile";
import SavedPosts from "../screens/SavedPosts";
import DetailPost from "../screens/DetailPost";
import CreateMenu from "../screens/CreateMenu";
import CreateProduct from "../screens/CreateProduct";
import CreateAviso from "../screens/CreateAviso";
import AvisosPage from "../screens/AvisosPage";
import AdminScreen from "../screens/AdminScreen";
import SearchResults from "../screens/SearchResults"; 

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const user = auth.currentUser;
  const isAdmin = user?.email === "driza.compraventa@gmail.com";

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          paddingBottom: 1,
          height: 58,
        },
        tabBarLabelStyle: {
          paddingBottom: 1,
          fontSize: 12,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Driza - Inicio"
        component={MainPage}
        options={{
          tabBarIcon: () => <FontAwesome name="home" size={24} color="black" />,
        }}
      />
      <Tab.Screen
        name="Driza - Avisos"
        component={AvisosPage}
        options={{
          tabBarIcon: () => <FontAwesome name="bell" size={24} color="black" />,
        }}
      />
      <Tab.Screen
        name="Driza - Crear publicación"
        component={CreateMenu}
        options={{
          tabBarIcon: () => <FontAwesome name="plus" size={24} color="black" />,
        }}
      />
      <Tab.Screen
        name="Driza - Guardados"
        component={SavedPosts}
        options={{
          tabBarIcon: () => (
            <FontAwesome name="bookmark" size={24} color="black" />
          ),
        }}
      />
      <Tab.Screen
        name="Driza - Perfil"
        component={Profile}
        options={{
          tabBarIcon: () => <FontAwesome name="user" size={24} color="black" />,
        }}
      />

      {/* Admin solo si es driza.compraventa@gmail.com */}
      {isAdmin && (
        <Tab.Screen
          name="Driza - Admin"
          component={AdminScreen}
          options={{
            tabBarIcon: () => (
              <FontAwesome name="shield" size={24} color="black" />
            ),
          }}
        />
      )}

      {/* Hidden screens */}
      <Tab.Screen
        name="Driza"
        component={DetailPost}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Driza - Publicar producto"
        component={CreateProduct}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" },
        }}
      />
      <Tab.Screen
        name="Driza - Publicar aviso"
        component={CreateAviso}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" },
        }}
      />
      <Tab.Screen
        name="Driza - Resultados de búsqueda"
        component={SearchResults}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" },
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
