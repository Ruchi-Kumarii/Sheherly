import React from "react";
import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { Colors } from "../../assets/colors";

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarInactiveTintColor: Colors.dark.text,
        tabBarStyle: {
          backgroundColor: Colors.SECONDARY,
          height: 88,
          paddingTop: 10,
          paddingBottom: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={25} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={25} color={color} />
          ),
        }}
      />

     
      <Tabs.Screen
        name="chatbot"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View
              className={`w-16 h-16 rounded-full items-center justify-center border-2 border-white shadow-xl ${
                focused ? "bg-[#085a73ff]" : "bg-slate-400"
              }`}
            >
              <Ionicons name="chatbox" size={26} color="white" />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => (
            <Ionicons name="location" size={25} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={25} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="offline"
        options={{
          href: null, // hidden from tab bar — accessible via profile screen
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
