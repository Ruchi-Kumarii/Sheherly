import { useRef, useState } from "react";
import {
  View, TouchableOpacity, Dimensions,
  Animated, Image, StyleSheet, StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const ONBOARDING_KEY = "sheherly_onboarding_done";

const slides = [
  {
    id: "1",
    image: require("../assets/images/sheherlyTitle.png"),
    accent: "#085a73",
  },
  {
    id: "2",
    image: require("../assets/images/intro2.png"),
    accent: "#16a34a",
  },
  {
    id: "3",
    image: require("../assets/images/intro3.png"),
    accent: "#7c3aed",
  },
];

export default function Onboarding({ onDone }) {
  const [current, setCurrent] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const slide = slides[current];

  const goNext = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      const next = current + 1;
      if (next >= slides.length) {
        finish();
        return;
      }
      setCurrent(next);
      Animated.timing(fadeAnim, { toValue: 1, duration: 120, useNativeDriver: true }).start();
    });
  };

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    onDone?.();
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Full screen image */}
      <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
        <Image
          source={slide.image}
          style={styles.image}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Bottom overlay with dots + buttons */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === current ? 24 : 8,
                  backgroundColor: i === current ? slide.accent : "#d1d5db",
                },
              ]}
            />
          ))}
        </View>

        {/* Next / Get Started */}
        <TouchableOpacity
          onPress={goNext}
          style={[styles.btn, { backgroundColor: slide.accent }]}
          activeOpacity={0.85}
        >
          <Animated.Text style={styles.btnText}>
            {current === slides.length - 1 ? "Get Started" : "Next"}
          </Animated.Text>
        </TouchableOpacity>

        {/* Skip */}
        {current < slides.length - 1 && (
          <TouchableOpacity onPress={finish} style={styles.skip}>
            <Animated.Text style={styles.skipText}>Skip</Animated.Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  image: {
    width,
    height,
  },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 20,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  btn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  btnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  skip: {
    alignItems: "center",
    paddingVertical: 4,
  },
  skipText: {
    color: "#888",
    fontSize: 14,
  },
});

// Helper to check if onboarding is needed
export async function shouldShowOnboarding() {
  const done = await AsyncStorage.getItem(ONBOARDING_KEY);
  return !done;
}
