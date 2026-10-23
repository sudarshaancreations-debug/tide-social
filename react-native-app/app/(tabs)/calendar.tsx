import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

export default function CalendarScreen() {
  const days = [
    { day: "Mon", date: "19" },
    { day: "Tue", date: "20" },
    { day: "Wed", date: "21" },
    { day: "Thu", date: "22" },
    { day: "Fri", date: "23", active: true },
    { day: "Sat", date: "24" },
    { day: "Sun", date: "25" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.scrubber}>
        {days.map((d, i) => (
          <TouchableOpacity key={i} style={[styles.dayItem, d.active && styles.dayActive]}>
            <Text style={[styles.dayText, d.active && styles.dayTextActive]}>{d.day}</Text>
            <Text style={[styles.dateText, d.active && styles.dateTextActive]}>{d.date}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionHeader}>TODAY'S SCHEDULED POSTS</Text>

      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Text style={styles.platformBadge}>Instagram Reel</Text>
          <Text style={styles.timeBadge}>11:30 AM</Text>
        </View>
        <Text style={styles.postTitle}>The 3-Hook Architecture for High-Retention Short Form</Text>
        <Text style={styles.postMeta}>Status: Queued · Verified Token</Text>
      </View>

      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Text style={[styles.platformBadge, { backgroundColor: "#176b9d" }]}>LinkedIn</Text>
          <Text style={styles.timeBadge}>03:00 PM</Text>
        </View>
        <Text style={styles.postTitle}>Why distribution eats creative strategy for breakfast</Text>
        <Text style={styles.postMeta}>Status: Queued · 4 Slides Carousel</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f4ee" },
  content: { padding: 16 },
  scrubber: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  dayItem: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#deddd5",
    minWidth: 42,
  },
  dayActive: { backgroundColor: "#171814", borderColor: "#171814" },
  dayText: { fontSize: 10, fontWeight: "700", color: "#6f7068" },
  dayTextActive: { color: "#c8f35c" },
  dateText: { fontSize: 14, fontWeight: "800", color: "#171814", marginTop: 2 },
  dateTextActive: { color: "#ffffff" },
  sectionHeader: { fontSize: 11, fontWeight: "800", color: "#6f7068", letterSpacing: 0.5, marginBottom: 12 },
  postCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#deddd5",
    marginBottom: 10,
  },
  postHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  platformBadge: {
    backgroundColor: "#ff745b",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  timeBadge: { fontSize: 11, color: "#6f7068", fontWeight: "600" },
  postTitle: { fontSize: 13, fontWeight: "700", color: "#171814", marginBottom: 4 },
  postMeta: { fontSize: 11, color: "#6f7068" },
});
