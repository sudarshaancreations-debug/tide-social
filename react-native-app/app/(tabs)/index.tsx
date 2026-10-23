import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { CheckCircle2, TrendingUp, Sparkles, Layers } from "lucide-react-native";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Greeting Banner */}
      <View style={styles.heroCard}>
        <Text style={styles.dateLabel}>Friday, 23 October</Text>
        <Text style={styles.heroTitle}>Good morning, Arjun</Text>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>All 4 channels operating normally</Text>
        </View>
      </View>

      {/* 2x2 Metric Grid */}
      <View style={styles.metricGrid}>
        <View style={[styles.metricCard, { borderLeftColor: "#ff745b" }]}>
          <Text style={styles.metricLabel}>30-DAY REACH</Text>
          <Text style={styles.metricValue}>142.8k</Text>
          <Text style={styles.metricTrend}>↑ 24% vs last mo</Text>
        </View>

        <View style={[styles.metricCard, { borderLeftColor: "#5c9108" }]}>
          <Text style={styles.metricLabel}>ENGAGEMENT</Text>
          <Text style={styles.metricValue}>4.8%</Text>
          <Text style={styles.metricTrend}>↑ 1.2% healthy</Text>
        </View>

        <View style={[styles.metricCard, { borderLeftColor: "#3388cc" }]}>
          <Text style={styles.metricLabel}>IN QUEUE</Text>
          <Text style={styles.metricValue}>18</Text>
          <Text style={styles.metricTrend}>7 slots ready</Text>
        </View>

        <View style={[styles.metricCard, { borderLeftColor: "#171814" }]}>
          <Text style={styles.metricLabel}>BRAND SCORE</Text>
          <Text style={styles.metricValue}>92%</Text>
          <Text style={styles.metricTrend}>4 rules verified</Text>
        </View>
      </View>

      {/* Approvals Action Card */}
      <View style={styles.panel}>
        <View style={styles.panelHead}>
          <Text style={styles.panelTitle}>Pending Approvals</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3 Review</Text>
          </View>
        </View>
        <Text style={styles.panelBodyText}>
          Creator drafts awaiting your final sign-off before scheduling.
        </Text>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Review Next Draft →</Text>
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
  heroCard: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6f7068",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#171814",
    marginVertical: 4,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e7f5eb",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2f9b64",
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1f7a4d",
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#deddd5",
    borderLeftWidth: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6f7068",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#171814",
    marginVertical: 4,
  },
  metricTrend: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2f9b64",
  },
  panel: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#deddd5",
  },
  panelHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#171814",
  },
  badge: {
    backgroundColor: "#ff745b",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
  },
  panelBodyText: {
    fontSize: 13,
    color: "#6f7068",
    marginBottom: 14,
  },
  actionBtn: {
    backgroundColor: "#171814",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
});
