import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { CHATBOT_URL } from "../../config";
import { consumeSupportMode } from "../../utils/supportFlag";

const API_URL = `${CHATBOT_URL}/chat`;
const SUPPORT_EMAIL = "sheherly2@gmail.com";
const SUPPORT_PHONE = "6299177132";

const ISSUE_OPTIONS = [
  { id: "1", label: "App not loading", icon: "🔄" },
  { id: "2", label: "Login / Signup issue", icon: "🔐" },
  { id: "3", label: "Map not working", icon: "🗺️" },
  { id: "4", label: "Wrong information", icon: "📋" },
  { id: "5", label: "Can't find a place", icon: "📍" },
  { id: "6", label: "Account / Password", icon: "👤" },
  { id: "7", label: "App crash / Bug", icon: "🐛" },
  { id: "8", label: "Something else", icon: "💬" },
];

const AUTO_REPLIES = {
  "1": "I understand the app isn't loading for you. Try closing and reopening the app. If the issue persists, check your internet connection and make sure the app is updated to the latest version. Still stuck? You can email us directly. 🔄",
  "2": "Login issues can be frustrating! Make sure you're using the correct email and password. Try 'Forgot Password' to reset it. If you still can't get in, reach out to us and we'll sort it out right away. 🔐",
  "3": "Map problems are usually caused by location permissions or a weak GPS signal. Go to Settings → Apps → Sheherly → Permissions and make sure Location is enabled. Then restart the app. 🗺️",
  "4": "Thanks for flagging that! We take accuracy seriously. Please describe what information looks wrong and where you found it — we'll investigate promptly. 📋",
  "5": "Try different keywords or zoom into the map area directly. Some new places may not be in our database yet — you can request an addition by emailing us. 📍",
  "6": "For account or password issues, use 'Change Password' in your Profile settings. If you've lost access to your email, contact us and we'll verify your identity manually. 👤",
  "7": "Sorry about the crash! Please note the steps that led to it and share them with us — screenshots are super helpful too. 🐛",
  "8": "No worries! Feel free to describe your issue below and I'll do my best to help. You can also reach our team directly. 💬",
};

/** Generates a short support ticket ID */
function generateTicketId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "SH-";
  for (let i = 0; i < 5; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Animated typing dots indicator */
function TypingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -5, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();

    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 }}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: "#7c3aed",
            transform: [{ translateY: dot }],
          }}
        />
      ))}
    </View>
  );
}

export default function ChatbotScreen() {
  // isSupportMode is STATE so the UI actually re-renders when it changes
  const [isSupportMode, setIsSupportMode] = useState(false);
  const [userName, setUserName] = useState("");
  const [messages, setMessages] = useState([]);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastIssueLabel, setLastIssueLabel] = useState("");
  const ticketIdRef = useRef(generateTicketId());

  const flatListRef = useRef(null);
  const tabBarHeight = useBottomTabBarHeight();

  // Fetch the user's name once
  useEffect(() => {
    const loadUser = async () => {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      try {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) setUserName(snap.data()?.name || "");
      } catch (_) {}
    };
    loadUser();
  }, []);

  // Every time this screen gains focus, consume the one-shot flag.
  // consumeSupportMode() returns true ONLY if customer-support set it,
  // then immediately clears it — so a plain tab tap always gets false.
  useFocusEffect(
    useCallback(() => {
      const comingFromSupport = consumeSupportMode();
      setIsSupportMode(comingFromSupport);

      if (comingFromSupport) {
        ticketIdRef.current = generateTicketId();
        // userName may not be loaded yet on first run — use a closure trick
        setUserName((prevName) => {
          const greeting = prevName ? `Hi ${prevName}! 👋` : "Hi there! 👋";
          setMessages([
            {
              id: "support-welcome-" + Date.now(),
              role: "bot",
              text: `${greeting} I'm Sheherly's support assistant.\n\nYour ticket ID is *${ticketIdRef.current}* — keep this for reference.\n\nWhat can I help you with today?`,
              isWelcome: true,
              time: new Date(),
            },
          ]);
          setOptionsVisible(true);
          setLastIssueLabel("");
          setInput("");
          return prevName; // don't actually change userName
        });
      } else {
        // Plain tab tap — always reset to normal Jaipur guide
        setMessages([]);
        setOptionsVisible(false);
        setLastIssueLabel("");
        setInput("");
      }
    }, []) // no deps — consumeSupportMode is a pure module call, not a hook
  );

  const scrollToEnd = () =>
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

  const addBotMessage = (text, extra = {}) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "bot", text, time: new Date(), ...extra },
      ]);
      scrollToEnd();
    }, 900);
  };

  const handleIssuePress = (option) => {
    setOptionsVisible(false);
    setLastIssueLabel(`${option.icon} ${option.label}`);
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", text: `${option.icon} ${option.label}`, time: new Date() },
    ]);
    addBotMessage(AUTO_REPLIES[option.id], { showFeedback: true, showEscalate: true });
  };

  const handleHelpfulYes = () => {
    setMessages((prev) =>
      prev.map((m) => (m.showFeedback ? { ...m, showFeedback: false, feedbackDone: "yes" } : m))
    );
    addBotMessage("Glad that helped! 🎉 Is there anything else I can assist you with?", {
      showFollowUp: true,
    });
  };

  const handleHelpfulNo = () => {
    setMessages((prev) =>
      prev.map((m) => (m.showFeedback ? { ...m, showFeedback: false, feedbackDone: "no" } : m))
    );
    addBotMessage(
      "I'm sorry it wasn't helpful 😔 Let me connect you to our team directly. They'll get back to you within 24 hours.",
      { showEscalate: true, showFollowUp: true }
    );
  };

  const handleEscalate = (subject) => {
    const body = `Ticket: ${ticketIdRef.current}\nIssue: ${subject || lastIssueLabel}\n\nPlease describe your problem in detail below:\n\n`;
    Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=Support Request - ${ticketIdRef.current}&body=${encodeURIComponent(body)}`
    );
  };

  const handleStartOver = () => {
    const greeting = userName ? `Hi ${userName}! 👋` : "Hi there! 👋";
    setMessages([
      {
        id: "support-welcome-" + Date.now(),
        role: "bot",
        text: `${greeting} What else can I help you with?`,
        isWelcome: true,
        time: new Date(),
      },
    ]);
    setOptionsVisible(true);
    setLastIssueLabel("");
  };

  const handleClearChat = () => {
    Alert.alert("Clear Chat", "Start a fresh conversation?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          if (isSupportMode) {
            handleStartOver();
          } else {
            setMessages([]);
          }
        },
      },
    ]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", text, time: new Date() },
    ]);
    scrollToEnd();

    if (isSupportMode) {
      setOptionsVisible(false);
      addBotMessage(
        `Thanks for reaching out! 🙏 I've noted your message.\n\nYour ticket ID is *${ticketIdRef.current}*. Our team will get back to you within 24 hours.`,
        { showEscalate: true, showFollowUp: true }
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const botText = data.reply || data.response || data.message || data.answer || "No response";
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "bot", text: botText, time: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "bot", text: "Server not reachable right now.", time: new Date() },
      ]);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  const renderBotExtras = (item) => (
    <>
      {/* Did this help? */}
      {item.showFeedback && (
        <View style={{ marginTop: 10, marginLeft: 36 }}>
          <Text style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: "600" }}>
            Did this help?
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={handleHelpfulYes}
              style={{
                flexDirection: "row", alignItems: "center", gap: 4,
                paddingVertical: 7, paddingHorizontal: 14,
                backgroundColor: "#f0fdf4", borderRadius: 20,
                borderWidth: 1.5, borderColor: "#16a34a",
              }}
            >
              <Text style={{ fontSize: 14 }}>👍</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#16a34a" }}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleHelpfulNo}
              style={{
                flexDirection: "row", alignItems: "center", gap: 4,
                paddingVertical: 7, paddingHorizontal: 14,
                backgroundColor: "#fef2f2", borderRadius: 20,
                borderWidth: 1.5, borderColor: "#dc2626",
              }}
            >
              <Text style={{ fontSize: 14 }}>👎</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#dc2626" }}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Escalate to email */}
      {item.showEscalate && (
        <View style={{ marginTop: 10, marginLeft: 36 }}>
          <TouchableOpacity
            onPress={() => handleEscalate(lastIssueLabel)}
            style={{
              flexDirection: "row", alignItems: "center", gap: 6,
              paddingVertical: 8, paddingHorizontal: 14,
              backgroundColor: "#eff6ff", borderRadius: 20,
              borderWidth: 1.5, borderColor: "#3b82f6",
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14 }}>📧</Text>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#1d4ed8" }}>
              Email Support
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Follow-up actions */}
      {item.showFollowUp && (
        <View style={{ marginTop: 10, marginLeft: 36, flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <TouchableOpacity
            onPress={handleStartOver}
            style={{
              flexDirection: "row", alignItems: "center", gap: 4,
              paddingVertical: 7, paddingHorizontal: 12,
              backgroundColor: "#f5f3ff", borderRadius: 20,
              borderWidth: 1.5, borderColor: "#7c3aed",
            }}
          >
            <Text style={{ fontSize: 12 }}>🔁</Text>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#7c3aed" }}>
              Ask another
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${SUPPORT_PHONE}`)}
            style={{
              flexDirection: "row", alignItems: "center", gap: 4,
              paddingVertical: 7, paddingHorizontal: 12,
              backgroundColor: "#f0fdf4", borderRadius: 20,
              borderWidth: 1.5, borderColor: "#16a34a",
            }}
          >
            <Text style={{ fontSize: 12 }}>📞</Text>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#16a34a" }}>
              Call Us
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-rose-50" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={tabBarHeight}
      >
        {/* Top Band */}
        <View className="absolute top-0 left-0 right-0 h-48 bg-violet-100 opacity-70" />

        {/* Header */}
        <View className="px-5 pt-5 pb-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="relative mr-3">
                <View className="w-12 h-12 rounded-2xl bg-violet-500 items-center justify-center shadow-lg">
                  <Text className="text-white text-lg">✦</Text>
                </View>
                <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
              </View>
              <View>
                <Text className="text-xl font-extrabold text-slate-900">Sheherly</Text>
                <Text className="text-xs font-semibold text-violet-500 mt-1">
                  {isSupportMode ? "Support Assistant 🎧" : "Your Jaipur Guide ✨"}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {/* Ticket badge in support mode */}
              {isSupportMode && (
                <View style={{
                  backgroundColor: "#ede9fe", borderRadius: 8,
                  paddingHorizontal: 8, paddingVertical: 4,
                }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#7c3aed" }}>
                    {ticketIdRef.current}
                  </Text>
                </View>
              )}
              {/* Clear chat button */}
              {messages.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearChat}
                  style={{
                    backgroundColor: "#f1f5f9", borderRadius: 10,
                    paddingHorizontal: 10, paddingVertical: 6,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748b" }}>
                    🗑 Clear
                  </Text>
                </TouchableOpacity>
              )}
              {!isSupportMode && (
                <View className="bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-full">
                  <Text className="text-violet-600 text-xs font-semibold">AI Powered</Text>
                </View>
              )}
            </View>
          </View>

          {/* Normal mode suggestion chips */}
          {!isSupportMode && messages.length === 0 && (
            <View className="flex-row flex-wrap gap-2 mt-4">
              {["Best places 🏯", "Local food 🍛", "Shopping 🛍️", "History 📜"].map((chip) => (
                <TouchableOpacity
                  key={chip}
                  onPress={() => setInput(chip.replace(/\s*[^\w\s].*$/, "").trim())}
                  className="bg-white border border-violet-200 px-3 py-1.5 rounded-full shadow-sm"
                >
                  <Text className="text-violet-700 text-xs font-medium">{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Chat card */}
        <View className="flex-1 mx-3 rounded-3xl bg-white border border-slate-100 overflow-hidden shadow-md">
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center justify-center mt-16 px-6">
                <View className="w-20 h-20 rounded-2xl bg-violet-50 border border-violet-100 items-center justify-center mb-4">
                  <Text className="text-3xl">🏯</Text>
                </View>
                <Text className="text-lg font-bold text-slate-800 mb-2">Namaste! 🙏</Text>
                <Text className="text-sm text-slate-400 text-center leading-5">
                  I'm Sheherly, your personal guide to the{" "}
                  <Text className="text-violet-500 font-bold">Pink City</Text>.
                </Text>
              </View>
            }
            renderItem={({ item }) =>
              item.role === "user" ? (
                <View style={{ alignSelf: "flex-end", maxWidth: "78%", marginVertical: 4 }}>
                  <View style={{
                    backgroundColor: "#7c3aed", paddingHorizontal: 16, paddingVertical: 12,
                    borderRadius: 18, borderBottomRightRadius: 4,
                  }}>
                    <Text style={{ color: "white", fontSize: 14, lineHeight: 20, fontWeight: "500" }}>
                      {item.text}
                    </Text>
                  </View>
                  {item.time && (
                    <Text style={{ fontSize: 10, color: "#94a3b8", marginTop: 3, textAlign: "right" }}>
                      {formatTime(item.time)}
                    </Text>
                  )}
                </View>
              ) : (
                <View style={{ marginVertical: 6 }}>
                  <View style={{ flexDirection: "row", alignItems: "flex-end", alignSelf: "flex-start", maxWidth: "85%" }}>
                    <View style={{
                      width: 28, height: 28, borderRadius: 14,
                      backgroundColor: "#7c3aed", alignItems: "center",
                      justifyContent: "center", marginRight: 8, marginBottom: 2, flexShrink: 0,
                    }}>
                      <Text style={{ color: "white", fontSize: 12 }}>✦</Text>
                    </View>
                    <View style={{
                      backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#f1f5f9",
                      paddingHorizontal: 14, paddingVertical: 12,
                      borderRadius: 18, borderBottomLeftRadius: 4, flex: 1,
                    }}>
                      {/* Bold *ticket* text support */}
                      <Text style={{ color: "#475569", fontSize: 14, lineHeight: 21 }}>
                        {item.text.split(/(\*[^*]+\*)/).map((part, i) =>
                          part.startsWith("*") && part.endsWith("*") ? (
                            <Text key={i} style={{ fontWeight: "800", color: "#7c3aed" }}>
                              {part.slice(1, -1)}
                            </Text>
                          ) : (
                            <Text key={i}>{part}</Text>
                          )
                        )}
                      </Text>
                    </View>
                  </View>

                  {item.time && (
                    <Text style={{ fontSize: 10, color: "#94a3b8", marginTop: 3, marginLeft: 36 }}>
                      {formatTime(item.time)}
                    </Text>
                  )}

                  {/* Issue chips after welcome */}
                  {item.isWelcome && optionsVisible && (
                    <View style={{ marginTop: 12, marginLeft: 36 }}>
                      <Text style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8, fontWeight: "600" }}>
                        Select your issue:
                      </Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        {ISSUE_OPTIONS.map((opt) => (
                          <TouchableOpacity
                            key={opt.id}
                            onPress={() => handleIssuePress(opt)}
                            activeOpacity={0.75}
                            style={{
                              flexDirection: "row", alignItems: "center", gap: 6,
                              paddingVertical: 8, paddingHorizontal: 12,
                              backgroundColor: "white", borderRadius: 20,
                              borderWidth: 1.5, borderColor: "#7c3aed", elevation: 2,
                            }}
                          >
                            <Text style={{ fontSize: 14 }}>{opt.icon}</Text>
                            <Text style={{ fontSize: 12, fontWeight: "600", color: "#7c3aed" }}>
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {renderBotExtras(item)}
                </View>
              )
            }
          />

          {/* Animated typing dots */}
          {loading && (
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12 }}>
              <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: "#7c3aed", alignItems: "center",
                justifyContent: "center", marginRight: 8,
              }}>
                <Text style={{ color: "white", fontSize: 12 }}>✦</Text>
              </View>
              <View style={{
                backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#f1f5f9",
                paddingHorizontal: 16, paddingVertical: 10,
                borderRadius: 18, borderBottomLeftRadius: 4,
              }}>
                <TypingDots />
              </View>
            </View>
          )}
        </View>

        {/* Input bar */}
        <View className="mx-3 mb-3 mt-2 flex-row items-center bg-white border border-violet-200 rounded-2xl px-4 py-3 shadow-sm">
          <Text className="text-lg mr-2">💬</Text>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={isSupportMode ? "Describe your issue..." : "Ask about Jaipur..."}
            placeholderTextColor="#a78bfa"
            className="flex-1 text-base text-slate-800"
            multiline
          />
          <TouchableOpacity
            onPress={sendMessage}
            className={`w-10 h-10 rounded-xl items-center justify-center ml-2 ${
              input.trim() ? "bg-violet-500" : "bg-slate-200"
            }`}
          >
            <Text className={`text-base ${input.trim() ? "text-white" : "text-slate-400"}`}>
              ➤
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
