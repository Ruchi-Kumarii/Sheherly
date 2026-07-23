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
import { setSupportMode } from "../../utils/supportFlag";

const SUPPORT_EMAIL = "sheherly2@gmail.com";
const SUPPORT_PHONE = "6299177132";

export default function CustomerSupport() {
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
          Customer Support
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
      >
        {/* Hero banner */}
        <View
          style={{
            backgroundColor: "#218fb4",
            borderRadius: 20,
            padding: 22,
            marginBottom: 28,
            alignItems: "center",
            shadowColor: "#218fb4",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 42, marginBottom: 10 }}>🎧</Text>
          <Text
            style={{
              color: "white",
              fontWeight: "800",
              fontSize: 20,
              marginBottom: 8,
            }}
          >
            How can we help you?
          </Text>
          <Text
            style={{
              color: "#e0f2fe",
              fontSize: 13,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Choose how you'd like to reach us. We're happy to help with any questions or issues.
          </Text>
        </View>

        {/* Section label */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: "#94a3b8",
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 12,
            marginLeft: 4,
          }}
        >
          Choose an option
        </Text>

        {/* Contact Us card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            Haptics.selectionAsync();
            router.push("/profile/contact-us");
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
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: "#e0f2fe",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <Text style={{ fontSize: 24 }}>📞</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 4 }}
            >
              Contact Us
            </Text>
            <Text style={{ fontSize: 13, color: "#64748b", lineHeight: 18 }}>
              Reach us via email or phone call directly
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </TouchableOpacity>

        {/* Chatbot card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            Haptics.selectionAsync();
            router.push("/(tabs)/chatbot");
          setSupportMode();
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
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: "#fef3c7",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <Text style={{ fontSize: 24 }}>🙋‍♀️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 4 }}
            >
              Chat with Assistant
            </Text>
            <Text style={{ fontSize: 13, color: "#64748b", lineHeight: 18 }}>
              Get instant help from our AI assistant 24/7
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "#218fb4",
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 3,
              marginRight: 8,
            }}
          >
            <Text style={{ color: "white", fontSize: 10, fontWeight: "700" }}>LIVE</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </TouchableOpacity>

        {/* Quick contact strip */}
        <View
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: 16,
            padding: 16,
            marginTop: 10,
            borderWidth: 1,
            borderColor: "#e2e8f0",
          }}
        >
          <Text
            style={{ fontSize: 12, fontWeight: "700", color: "#94a3b8", marginBottom: 12 }}
          >
            QUICK CONTACT
          </Text>
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Sheherly Support Request`);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingVertical: 6,
              marginBottom: 8,
            }}
          >
            <Ionicons name="mail-outline" size={18} color="#218fb4" />
            <Text style={{ color: "#218fb4", fontWeight: "600", fontSize: 14 }}>
              {SUPPORT_EMAIL}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              Linking.openURL(`tel:${SUPPORT_PHONE}`);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingVertical: 6,
            }}
          >
            <Ionicons name="call-outline" size={18} color="#218fb4" />
            <Text style={{ color: "#218fb4", fontWeight: "600", fontSize: 14 }}>
              +91 {SUPPORT_PHONE}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
