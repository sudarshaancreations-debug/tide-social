import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

export default function InboxScreen() {
  const threads = [
    {
      name: "Marcus Vance",
      platform: "IG",
      time: "2m ago",
      message: "Do you have the templates available for download anywhere?",
      unread: true,
    },
    {
      name: "Elena Rostova",
      platform: "LI",
      time: "14m ago",
      message: "Loved the breakdown on Reels hooks! Are you taking client slots for Q1?",
      unread: true,
    },
    {
      name: "Sarah Lin",
      platform: "TikTok",
      time: "1h ago",
      message: "Saved this! Where can I sign up for the weekly newsletter?",
      unread: false,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionHeader}>HIGH-INTENT CONVERSATIONS</Text>
      {threads.map((t, idx) => (
        <TouchableOpacity key={idx} style={styles.threadCard}>
          <View style={styles.threadHead}>
            <View style={styles.threadLeft}>
              <View style={styles.platformIcon}>
                <Text style={styles.platformText}>{t.platform}</Text>
              </View>
              <Text style={styles.threadName}>{t.name}</Text>
            </View>
            <Text style={styles.threadTime}>{t.time}</Text>
          </View>
          <Text style={styles.threadMsg} numberOfLines={2}>{t.message}</Text>
          {t.unread && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f4ee" },
  content: { padding: 16 },
  sectionHeader: { fontSize: 11, fontWeight: "800", color: "#6f7068", letterSpacing: 0.5, marginBottom: 12 },
  threadCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#deddd5",
    marginBottom: 10,
    position: "relative",
  },
  threadHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  threadLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  platformIcon: { width: 22, height: 22, borderRadius: 5, backgroundColor: "#ff745b", alignItems: "center", justifyContent: "center" },
  platformText: { color: "#ffffff", fontSize: 9, fontWeight: "800" },
  threadName: { fontSize: 13, fontWeight: "700", color: "#171814" },
  threadTime: { fontSize: 10, color: "#6f7068" },
  threadMsg: { fontSize: 12, color: "#6f7068", lineHeight: 17 },
  unreadDot: { position: "absolute", top: 14, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: "#ff745b" },
});
