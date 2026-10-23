import React from "react";
import { Tabs } from "expo-router";
import { Platform, View, Text, StyleSheet } from "react-native";
import { Home, Calendar, PlusCircle, MessageSquare, User } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ff745b",
        tabBarInactiveTintColor: "#8c8e85",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#deddd5",
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
        },
        headerStyle: {
          backgroundColor: "#f6f4ee",
          borderBottomColor: "#deddd5",
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 17,
          color: "#171814",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={22} />,
          headerTitle: "Tide Social",
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={22} />,
          headerTitle: "Publishing Schedule",
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color }) => (
            <View style={styles.createButton}>
              <PlusCircle color="#ffffff" size={28} />
            </View>
          ),
          headerTitle: "New Social Post",
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={22} />,
          headerTitle: "Unified Inbox",
          tabBarBadge: 12,
          tabBarBadgeStyle: {
            backgroundColor: "#ff745b",
            color: "#ffffff",
            fontSize: 9,
            fontWeight: "700",
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={22} />,
          headerTitle: "Profile & Workspace",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ff745b",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Platform.OS === "ios" ? 14 : 0,
    shadowColor: "#ff745b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
});
