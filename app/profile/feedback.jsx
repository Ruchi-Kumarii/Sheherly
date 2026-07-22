import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import Toast from "../../components/Toast";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";

const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
const ratingColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];

const feedbackAreas = [
  { id: "1", label: "Map & Navigation", icon: "🗺️" },
  { id: "2", label: "Search Results", icon: "🔍" },
  { id: "3", label: "App Performance", icon: "⚡" },
  { id: "4", label: "Design & UI", icon: "🎨" },
  { id: "5", label: "Information Accuracy", icon: "📋" },
  { id: "6", label: "Overall Experience", icon: "✨" },
];

export default function Feedback() {
  const router = useRouter();
  const { isOnline } = useNetworkStatus();

  const [rating, setRating] = useState(0);
  const [selectedArea, setSelectedArea] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });

  const showToast = (msg, type = "info") => {
    setToast({ visible: true, message: msg, type });
  };

  const handleSubmit = async () => {
    if (!isOnline) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      showToast("Internet required to submit feedback", "error");
      return;
    }
    if (rating === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      showToast("Please give a star rating", "error");
      return;
    }
    if (!message.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      showToast("Please write a short message", "error");
      return;
    }

    try {
      setSubmitting(true);
      const user = auth.currentUser;

      await addDoc(collection(db, "feedback"), {
        rating,
        area: selectedArea?.label ?? "General",
        message: message.trim(),
        userId: user?.uid ?? "guest",
        userEmail: user?.email ?? "anonymous",
        createdAt: serverTimestamp(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("Thank you for your feedback! 🙏", "success");
      setTimeout(() => router.back(), 1800);
    } catch (err) {
      console.log("FEEDBACK SUBMIT ERROR:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast("Failed to submit. Please try again.", "error");
    } finally {
      setSubmitting(false);
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
          Send Feedback
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
              You're offline. Connect to the internet to submit feedback.
            </Text>
          </View>
        )}

        {/* Intro */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 18,
            marginBottom: 20,
            shadowColor: "#64748b",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 28, marginBottom: 8 }}>💬</Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 6 }}>
            How are we doing?
          </Text>
          <Text style={{ fontSize: 13, color: "#64748b", textAlign: "center", lineHeight: 20 }}>
            Your feedback helps us improve Sheherly for everyone. We read every response.
          </Text>
        </View>

        {/* Star rating */}
        <Text
          style={{ fontSize: 15, fontWeight: "700", color: "#1e293b", marginBottom: 10 }}
        >
          Overall Rating
        </Text>
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            alignItems: "center",
            shadowColor: "#64748b",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 10 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => {
                  Haptics.selectionAsync();
                  setRating(star);
                }}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={36}
                  color={star <= rating ? "#f59e0b" : "#cbd5e1"}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: ratingColors[rating],
              }}
            >
              {ratingLabels[rating]}
            </Text>
          )}
        </View>

        {/* Feedback area */}
        <Text
          style={{ fontSize: 15, fontWeight: "700", color: "#1e293b", marginBottom: 10 }}
        >
          What are you rating? (optional)
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
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {feedbackAreas.map((area) => {
              const isSelected = selectedArea?.id === area.id;
              return (
                <TouchableOpacity
                  key={area.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedArea(isSelected ? null : area);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 20,
                    backgroundColor: isSelected ? "#e0f2fe" : "#f8fafc",
                    borderWidth: 1.5,
                    borderColor: isSelected ? "#0284c7" : "#e2e8f0",
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{area.icon}</Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: isSelected ? "700" : "500",
                      color: isSelected ? "#0369a1" : "#475569",
                    }}
                  >
                    {area.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Message */}
        <Text
          style={{ fontSize: 15, fontWeight: "700", color: "#1e293b", marginBottom: 10 }}
        >
          Your Message
        </Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Share your thoughts, suggestions, or experience..."
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

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={{
            backgroundColor: "#218fb4",
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
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="paper-plane" size={18} color="white" />
              <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
                Submit Feedback
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
