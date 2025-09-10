// filepath: src/components/TabNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MainPage from "../screens/MainPage";
import Profile from "../screens/Profile";
import SavedPosts from "../screens/SavedPosts";
import DetailPost from "../screens/DetailPost";
import CreateMenu from "../screens/CreateMenu";
import CreateProduct from "../screens/CreateProduct";
import CreateAviso from "../screens/CreateAviso";
import AvisosPage from "../screens/AvisosPage"; // 📌 importamos la nueva screen
import { FontAwesome } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
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
        name="Inicio"
        component={MainPage}
        options={{
          tabBarIcon: () => <FontAwesome name="home" size={24} color="black" />,
        }}
      />
      <Tab.Screen
        name="Avisos"
        component={AvisosPage}
        options={{
          tabBarIcon: () => <FontAwesome name="bell" size={24} color="black" />,
        }}
      />
      <Tab.Screen
        name="Crear"
        component={CreateMenu}
        options={{
          tabBarIcon: () => <FontAwesome name="plus" size={24} color="black" />,
        }}
      />
      
      <Tab.Screen
        name="Guardados"
        component={SavedPosts}
        options={{
          tabBarIcon: () => <FontAwesome name="bookmark" size={24} color="black" />,
        }}
      />

      <Tab.Screen
        name="Perfil"
        component={Profile}
        options={{
          tabBarIcon: () => <FontAwesome name="user" size={24} color="black" />,
        }}
      />

      {/* DetailPost sigue oculto */}
      <Tab.Screen
        name="DetailPost"
        component={DetailPost}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" },
          headerShown: false,
        }}
      />

      {/* CreateProduct y CreateAviso solo accesibles desde CreateMenu */}
      <Tab.Screen
        name="CreateProduct"
        component={CreateProduct}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" },
        }}
      />

      <Tab.Screen
        name="CreateAviso"
        component={CreateAviso}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" },
        }}
      />

  
      
    </Tab.Navigator>
  );
};

export default TabNavigator;
