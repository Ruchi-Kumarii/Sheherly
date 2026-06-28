import { useEffect, useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, Dimensions,
  Animated, FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const ONBOARDING_KEY = "sheherly_onboarding_done";

const slides = [
  {
    id: "1",
    emoji: "🏯",
    title: "Explore Jaipur",
    desc: "Discover food, hotels, hospitals, transport and more — all in one place.",
    bg: "#e8f4f8",
    accent: "#085a73",
  },
  {
    id: "2",
    emoji: "🗺️",
    title: "Navigate with Ease",
    desc: "Get directions to any spot in Jaipur using the built-in map.",
    bg: "#f0fdf4",
    accent: "#16a34a",
  },
  {
    id: "3",
    emoji: "🤖",
    title: "AI City Guide",
    desc: "Ask Sheherly anything about the Pink City — food, history, shopping and more.",
    bg: "#f5f3ff",
    accent: "#7c3aed",
  },
  {
    id: "4",
    emoji: "📴",
    title: "Works Offline Too",
    desc: "Save your favourite places and access them even without internet.",
    bg: "#fff7ed",
    accent: "#ea580c",
  },
];

export default function Onboarding({ onDone }) {
  const [current, setCurrent] = useState(0);
  const flatRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goNext = () => {
    if (current < slides.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      const next = current + 1;
      setCurrent(next);
      flatRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      finish();
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    onDone?.();
  };

  const slide = slides[current];

  return (
    <View style={{ flex: 1, backgroundColor: slide.bg }}>
      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Animated.View
            style={{
              width,
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 36,
              opacity: fadeAnim,
            }}
          >
            <Text style={{ fontSize: 90, marginBottom: 32 }}>{item.emoji}</Text>
            <Text style={{
              fontSize: 28, fontWeight: "800", color: "#1a1a1a",
              textAlign: "center", marginBottom: 16,
            }}>
              {item.title}
            </Text>
            <Text style={{
              fontSize: 16, color: "#555", textAlign: "center",
              lineHeight: 24,
            }}>
              {item.desc}
            </Text>
          </Animated.View>
        )}
      />

      {/* Dots */}
      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 24 }}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === current ? slide.accent : "#d1d5db",
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 48, gap: 12 }}>
        <TouchableOpacity
          onPress={goNext}
          style={{
            backgroundColor: slide.accent,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
            {current === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>

        {current < slides.length - 1 && (
          <TouchableOpacity onPress={finish} style={{ alignItems: "center", paddingVertical: 8 }}>
            <Text style={{ color: "#888", fontSize: 14 }}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Helper to check if onboarding is needed
export async function shouldShowOnboarding() {
  const done = await AsyncStorage.getItem(ONBOARDING_KEY);
  return !done;
}
