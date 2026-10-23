import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { ShieldCheck, Users, CreditCard, Cpu, ChevronRight } from "lucide-react-native";

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Hero */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AK</Text>
        </View>
        <Text style={styles.userName}>Arjun Kapoor</Text>
        <Text style={styles.userTitle}>Head of Growth & Content Strategy</Text>
        <View style={styles.pillRow}>
          <View style={styles.ownerBadge}>
            <Text style={styles.ownerBadgeText}>★ Workspace Owner</Text>
          </View>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>Studio Pro</Text>
          </View>
        </View>
      </View>

      {/* Segmented Options */}
      <View style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Users size={18} color="#171814" />
            <Text style={styles.menuItemText}>Team Members & Seats</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.menuSub}>3 of 5 active</Text>
            <ChevronRight size={16} color="#8c8e85" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <CreditCard size={18} color="#171814" />
            <Text style={styles.menuItemText}>Plan & Invoices</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.menuSub}>$99 / mo</Text>
            <ChevronRight size={16} color="#8c8e85" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Cpu size={18} color="#171814" />
            <Text style={styles.menuItemText}>Model Context Protocol (MCP)</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.menuSub}>17 Tools</Text>
            <ChevronRight size={16} color="#8c8e85" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
          <View style={styles.menuItemLeft}>
            <ShieldCheck size={18} color="#171814" />
            <Text style={styles.menuItemText}>Security & 2FA</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={[styles.menuSub, { color: "#2f9b64" }]}>Enabled</Text>
            <ChevronRight size={16} color="#8c8e85" />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f4ee",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#deddd5",
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ffe57a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#423811",
  },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#171814",
  },
  userTitle: {
    fontSize: 12,
    color: "#6f7068",
    marginTop: 2,
    marginBottom: 10,
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
  },
  ownerBadge: {
    backgroundColor: "#171814",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  ownerBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  planBadge: {
    backgroundColor: "#eef9f2",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#c9eed7",
  },
  planBadgeText: {
    color: "#1f7a4d",
    fontSize: 10,
    fontWeight: "700",
  },
  menuCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#deddd5",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#deddd5",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#171814",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  menuSub: {
    fontSize: 12,
    color: "#6f7068",
  },
});
