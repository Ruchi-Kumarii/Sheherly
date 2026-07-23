import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";

const SUPPORT_EMAIL = "sheherly2@gmail.com";
const SUPPORT_PHONE = "6299177132";

export default function ContactUs() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7fb" }}>
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
          Contact Us
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
      >
        {/* Intro */}
        <View style={{ alignItems: "center", marginBottom: 28, marginTop: 8 }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>👋</Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: "#1e293b",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            We'd love to hear from you
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#64748b",
              textAlign: "center",
              lineHeight: 20,
              maxWidth: 280,
            }}
          >
            Reach out to us anytime. We're available to help and will get back to you within 24 hours.
          </Text>
        </View>

        {/* Email card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            Haptics.selectionAsync();
            Linking.openURL(
              `mailto:${SUPPORT_EMAIL}?subject=Sheherly Support Request`
            );
          }}
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 20,
            marginBottom: 14,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#64748b",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              backgroundColor: "#e0f2fe",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <Text style={{ fontSize: 26 }}>📧</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: "#94a3b8",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Email Us
            </Text>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#218fb4" }}>
              {SUPPORT_EMAIL}
            </Text>
            <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
              We reply within 24 hours
            </Text>
          </View>
          <Ionicons name="open-outline" size={18} color="#cbd5e1" />
        </TouchableOpacity>

        {/* Phone card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            Haptics.selectionAsync();
            Linking.openURL(`tel:${SUPPORT_PHONE}`);
          }}
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 20,
            marginBottom: 14,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#64748b",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              backgroundColor: "#f0fdf4",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <Text style={{ fontSize: 26 }}>📞</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: "#94a3b8",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Call Us
            </Text>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#16a34a" }}>
              +91 {SUPPORT_PHONE}
            </Text>
            <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
              Tap to call directly
            </Text>
          </View>
          <Ionicons name="call-outline" size={18} color="#cbd5e1" />
        </TouchableOpacity>

        {/* Info strip */}
        <View
          style={{
            backgroundColor: "#eff6ff",
            borderRadius: 14,
            padding: 16,
            marginTop: 12,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 18, marginTop: 1 }}>ℹ️</Text>
          <Text style={{ color: "#1e40af", fontSize: 13, lineHeight: 20, flex: 1 }}>
            For the fastest response, email us with a short description of your issue.
            Our team will follow up within 24 hours.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
