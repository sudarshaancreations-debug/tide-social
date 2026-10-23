import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { Sparkles, Send, Image as ImageIcon } from "lucide-react-native";

export default function CreateScreen() {
  const [copy, setCopy] = useState("");

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>WHAT DO YOU WANT TO TALK ABOUT?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="e.g. 3 counter-intuitive lessons learned scaling our organic Instagram reach to 100k..."
          placeholderTextColor="#9a9b93"
          multiline
          numberOfLines={6}
          value={copy}
          onChangeText={setCopy}
        />

        <View style={styles.chipRow}>
          <TouchableOpacity style={styles.aiChip}>
            <Sparkles size={14} color="#ff745b" />
            <Text style={styles.aiChipText}>Generate Hooks</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.aiChip}>
            <Text style={styles.aiChipText}>Brand Voice Audit</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.publishBtn}>
          <Send size={16} color="#ffffff" />
          <Text style={styles.publishBtnText}>Queue for Approval</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f4ee" },
  content: { padding: 16 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#deddd5",
  },
  label: { fontSize: 10, fontWeight: "700", color: "#6f7068", letterSpacing: 0.5, marginBottom: 8 },
  textArea: {
    backgroundColor: "#faf9f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#171814",
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#deddd5",
  },
  chipRow: { flexDirection: "row", gap: 8, marginVertical: 12 },
  aiChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#deddd5",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  aiChipText: { fontSize: 11, fontWeight: "700", color: "#171814" },
  publishBtn: {
    backgroundColor: "#ff745b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 6,
  },
  publishBtnText: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
});
