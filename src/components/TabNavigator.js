// filepath: src/components/TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainPage from '../screens/MainPage';
import Profile from '../screens/Profile';
import CreatePost from '../screens/CreatePost';
import SavedPosts from '../screens/SavedPosts';
import { FontAwesome } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          paddingBottom: 1, // Espacio adicional en la parte inferior del Tab Navigator
          height: 58, // Ajusta la altura del Tab Navigator
        },
        tabBarLabelStyle: {
          paddingBottom: 1, // Espacio adicional debajo de las etiquetas
          fontSize: 12, // Ajusta el tamaño del texto si es necesario
        },
        headerShown: false, // Oculta el encabezado de la pantalla
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
        name="Crear" 
        component={CreatePost} 
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
    </Tab.Navigator>
  );
};

export default TabNavigator;