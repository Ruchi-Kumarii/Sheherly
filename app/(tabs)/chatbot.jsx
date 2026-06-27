import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { CHATBOT_URL } from "../../config";

const API_URL = `${CHATBOT_URL}/chat`;

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const tabBarHeight = useBottomTabBarHeight();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await res.json();

      const botText =
        data.reply ||
        data.response ||
        data.message ||
        data.answer ||
        "No response";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: botText,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: "Server not reachable right now.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-rose-50" edges={["top"]}>

      {/* Wrap everything so the input floats above the keyboard */}
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
                <Text className="text-xl font-extrabold text-slate-900">
                  Sheherly
                </Text>
                <Text className="text-xs font-semibold text-violet-500 mt-1">
                  Your Jaipur Guide ✨
                </Text>
              </View>
            </View>

            <View className="bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-full">
              <Text className="text-violet-600 text-xs font-semibold">
                AI Powered
              </Text>
            </View>
          </View>

          {/* Chips */}
          {messages.length === 0 && (
            <View className="flex-row flex-wrap gap-2 mt-4">
              {["Best places 🏯", "Local food 🍛", "Shopping 🛍️", "History 📜"].map(
                (chip) => (
                  <TouchableOpacity
                    key={chip}
                    onPress={() =>
                      setInput(chip.replace(/\s*[^\w\s].*$/, "").trim())
                    }
                    className="bg-white border border-violet-200 px-3 py-1.5 rounded-full shadow-sm"
                  >
                    <Text className="text-violet-700 text-xs font-medium">
                      {chip}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          )}
        </View>

        {/* Chat Card — flex-1 so it fills the space between header and input */}
        <View className="flex-1 mx-3 rounded-3xl bg-white border border-slate-100 overflow-hidden shadow-md">
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center justify-center mt-16 px-6">
                <View className="w-20 h-20 rounded-2xl bg-violet-50 border border-violet-100 items-center justify-center mb-4">
                  <Text className="text-3xl">🏯</Text>
                </View>

                <Text className="text-lg font-bold text-slate-800 mb-2">
                  Namaste! 🙏
                </Text>

                <Text className="text-sm text-slate-400 text-center leading-5">
                  I'm Sheherly, your personal guide to the{" "}
                  <Text className="text-violet-500 font-bold">Pink City</Text>.
                </Text>
              </View>
            }
            renderItem={({ item }) =>
              item.role === "user" ? (
                <View className="self-end max-w-[78%] my-2">
                  <View className="bg-violet-500 px-4 py-3 rounded-2xl rounded-tr-md">
                    <Text className="text-white text-sm leading-5 font-medium">
                      {item.text}
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="self-start max-w-[78%] my-2 flex-row items-end">
                  <View className="w-7 h-7 rounded-full bg-violet-400 items-center justify-center mr-2 mb-1">
                    <Text className="text-white text-xs">✦</Text>
                  </View>

                  <View className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-md">
                    <Text className="text-slate-600 text-sm leading-5">
                      {item.text}
                    </Text>
                  </View>
                </View>
              )
            }
          />

          {/* Typing indicator */}
          {loading && (
            <View className="flex-row items-end px-4 pb-3">
              <View className="w-7 h-7 rounded-full bg-violet-400 items-center justify-center mr-2">
                <Text className="text-white text-xs">✦</Text>
              </View>

              <View className="flex-row items-center bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-md">
                <ActivityIndicator size="small" color="#7c3aed" />
                <Text className="text-slate-400 text-sm italic ml-2">
                  Thinking…
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Input — sits outside the chat card so it rises with the keyboard */}
        <View className="mx-3 mb-3 mt-2 flex-row items-center bg-white border border-violet-200 rounded-2xl px-4 py-3 shadow-sm">
          <Text className="text-lg mr-2">💬</Text>

          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about Jaipur..."
            placeholderTextColor="#a78bfa"
            className="flex-1 text-base text-slate-800"
          />

          <TouchableOpacity
            onPress={sendMessage}
            className={`w-10 h-10 rounded-xl items-center justify-center ml-2 ${
              input.trim() ? "bg-violet-500" : "bg-slate-200"
            }`}
          >
            <Text
              className={`text-base ${
                input.trim() ? "text-white" : "text-slate-400"
              }`}
            >
              ➤
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}