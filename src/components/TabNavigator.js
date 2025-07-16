// filepath: src/components/TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainPage from './MainPage';
import Profile from './Profile';
import CreatePost from './CreatePost';
import SavedPosts from './SavedPosts';
import { FontAwesome } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
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
        name="Perfil" 
        component={Profile} 
        options={{
          tabBarIcon: () => <FontAwesome name="user" size={24} color="black" />,
        }} 
      />
      <Tab.Screen 
        name="Guardados" 
        component={SavedPosts} 
        options={{
          tabBarIcon: () => <FontAwesome name="bookmark" size={24} color="black" />,
        }} 
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;