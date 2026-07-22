import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import Toast from "../../components/Toast";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { auth } from "../../firebase";
import { ADMIN_URL } from "../../config";

const SUPPORT_EMAIL = "kiro21223@gmail.com";

const issueCategories = [
  { id: "1", label: "App Bug / Error", icon: "🐛" },
  { id: "2", label: "Login / Account Issue", icon: "🔐" },
  { id: "3", label: "Map / Location Problem", icon: "🗺️" },
  { id: "4", label: "Incorrect Information", icon: "📋" },
  { id: "5", label: "Feature Request", icon: "💡" },
  { id: "6", label: "Other", icon: "💬" },
];

export default function CustomerSupport() {
  const router = useRouter();
  const { isOnline } = useNetworkStatus();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });

  // Ping the server as soon as screen opens so free-tier cold start
  // happens in the background before the user hits Submit
  useEffect(() => {
    fetch(`${ADMIN_URL}/`).catch(() => {});
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
  };

  const handleSendRequest = async () => {
    if (!isOnline) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      showToast("Internet required to contact support", "error");
      return;
    }
    if (!selectedCategory) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      showToast("Please select an issue category", "error");
      return;
    }
    if (!description.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      showToast("Please describe your issue", "error");
      return;
    }

    const user = auth.currentUser;
    const userEmail = user?.email;

    if (!userEmail) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      showToast("Sign in to submit a support request", "error");
      return;
    }

    try {
      setSending(true);

      // Allow up to 90s for Render free tier cold start
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000);

      let response;
      try {
        response = await fetch(`${ADMIN_URL}/api/admin/support-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            userEmail,
            category: selectedCategory.label,
            description: description.trim(),
          }),
        });
      } finally {
        clearTimeout(timeout);
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Server error ${response.status}`);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast(`Request sent! Check ${userEmail} for your confirmation ✅`, "success");
      setDescription("");
      setSelectedCategory(null);
    } catch (err) {
      console.log("SUPPORT REQUEST ERROR:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (err.name === "AbortError") {
        showToast("Server is waking up. Please try again in 30 seconds.", "error");
      } else {
        showToast(err.message || "Failed to send request. Please try again.", "error");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f6f7fb]">
      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderBottomColor: "#f1f5f9",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#1e293b" }}>
          Customer Support
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Offline banner */}
        {!isOnline && (
          <View
            style={{
              backgroundColor: "#fff7ed",
              borderColor: "#fb923c",
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 16 }}>📡</Text>
            <Text style={{ color: "#9a3412", fontSize: 13, flex: 1 }}>
              You're offline. Connect to the internet to reach support.
            </Text>
          </View>
        )}

        {/* Contact info card */}
        <View
          style={{
            backgroundColor: "#218fb4",
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            shadowColor: "#218fb4",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Text style={{ fontSize: 24 }}>🎧</Text>
            <Text style={{ color: "white", fontWeight: "800", fontSize: 17 }}>
              We're here to help
            </Text>
          </View>
          <Text style={{ color: "#e0f2fe", fontSize: 13, lineHeight: 20 }}>
            Submit your request below and you'll instantly receive a confirmation email. Our team will look into your problem and respond within 24 hours.
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
            style={{
              marginTop: 14,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="mail-outline" size={18} color="white" />
            <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>
              {SUPPORT_EMAIL}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Auto-reply notice */}
        <View
          style={{
            backgroundColor: "#f0fdf4",
            borderColor: "#86efac",
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginBottom: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Text style={{ fontSize: 18 }}>✉️</Text>
          <Text style={{ color: "#166534", fontSize: 13, flex: 1, lineHeight: 18 }}>
            An automated confirmation will be sent to your registered email as soon as you submit.
          </Text>
        </View>

        {/* Issue category */}
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: "#1e293b",
            marginBottom: 10,
          }}
        >
          What's the issue?
        </Text>
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 12,
            marginBottom: 20,
            shadowColor: "#64748b",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {issueCategories.map((cat) => {
            const isSelected = selectedCategory?.id === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedCategory(cat);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  marginBottom: 4,
                  backgroundColor: isSelected ? "#e0f2fe" : "transparent",
                }}
              >
                <Text style={{ fontSize: 20, marginRight: 12 }}>{cat.icon}</Text>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: isSelected ? "#0369a1" : "#334155",
                    fontWeight: isSelected ? "700" : "500",
                  }}
                >
                  {cat.label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color="#0369a1" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Description */}
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: "#1e293b",
            marginBottom: 10,
          }}
        >
          Describe your problem
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Tell us what happened in detail so we can help you faster..."
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 14,
            fontSize: 14,
            color: "#1e293b",
            minHeight: 120,
            marginBottom: 24,
            shadowColor: "#64748b",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        />

        {/* Submit button */}
        <TouchableOpacity
          onPress={handleSendRequest}
          disabled={sending}
          style={{
            backgroundColor: sending ? "#93c5fd" : "#218fb4",
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
            shadowColor: "#218fb4",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          {sending ? (
            <>
              <ActivityIndicator color="white" />
              <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
                Sending...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="send" size={18} color="white" />
              <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
                Submit Request
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text
          style={{
            textAlign: "center",
            color: "#94a3b8",
            fontSize: 12,
            marginTop: 12,
            lineHeight: 18,
          }}
        >
          You'll receive an automated confirmation email immediately.{"\n"}
          Our team will follow up within 24 hours.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
