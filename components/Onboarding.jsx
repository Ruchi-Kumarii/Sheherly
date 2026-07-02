import { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

// ── Version-based onboarding: bump APP_VERSION to force re-show after updates ──
const APP_VERSION = "1.0.1";
const ONBOARDING_VERSION_KEY = "sheherly_onboarding_version";
const ONBOARDING_OLD_KEY = "sheherly_onboarding_done"; // legacy key — cleared on first run

const slides = [
  {
    id: "1",
    image: require("../assets/images/intro1.png"),
    title: "Explore Jaipur\nLike a Local",
    subtitle: "Discover the best food, stays, transport,\nand hidden gems — all in one app.",
    accent: "#085a73",
    bg: "#e8e4dc",   // exact beige/cream from intro1.png
  },
  {
    id: "2",
    image: require("../assets/images/intro2.png"),
    title: "PG? Flat? Hostel?\nI got you homie!",
    subtitle: "Find the perfect accommodation — from\nbudget hostels to cozy flats — near you.",
    accent: "#218fb4",
    bg: "#cce7ec",   // exact light teal from intro2.png
  },
  {
    id: "3",
    image: require("../assets/images/intro3.png"),
    title: "Your AI Guide\nto the City",
    subtitle: "Ask our chatbot anything about Jaipur —\nroutes, timings, tips and more.",
    accent: "#085a73",
    bg: "#cce7ec",   // exact light teal from intro3.png
  },
];

const BOTTOM_H = height * 0.36;
const IMAGE_H = height - BOTTOM_H;

export default function Onboarding({ onDone }) {
  const [current, setCurrent] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const slide = slides[current];

  const finish = async () => {
    // Mark this version as seen — clears any legacy flag too
    await AsyncStorage.setItem(ONBOARDING_VERSION_KEY, APP_VERSION);
    await AsyncStorage.removeItem(ONBOARDING_OLD_KEY);
    onDone?.();
  };

  const goNext = () => {
    if (current < slides.length - 1) {
      const next = current + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrent(next);
    } else {
      finish();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrent(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }) => (
    <View style={{ width, height: IMAGE_H, backgroundColor: item.bg }}>
      <Image
        source={item.image}
        style={{ width, height: IMAGE_H }}
        resizeMode="cover"
      />
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Full-width swipeable image pager */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={{ height: IMAGE_H }}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Top bar floats over image */}
      <View style={styles.topBar}>
        <Text style={styles.appName}>Sheherly</Text>
        {current < slides.length - 1 && (
          <TouchableOpacity
            onPress={finish}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom card — same bg as current slide so no harsh edge */}
      <View style={[styles.bottomCard, { backgroundColor: slide.bg }]}>
        <Text style={[styles.title, { color: slide.accent }]}>{slide.title}</Text>

        <Text style={styles.subtitle}>{slide.subtitle}</Text>

        {/* Animated dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
              extrapolate: "clamp",
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity, backgroundColor: slide.accent },
                ]}
              />
            );
          })}
        </View>

        {/* CTA button */}
        <TouchableOpacity
          onPress={goNext}
          style={[styles.btn, { backgroundColor: slide.accent }]}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>
            {current === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#e8e4dc",
  },
  topBar: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 20,
  },
  appName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.4,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomCard: {
    height: BOTTOM_H,
    marginTop: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  btn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

// ── Called from index.jsx before showing app ──
export async function shouldShowOnboarding() {
  const stored = await AsyncStorage.getItem(ONBOARDING_VERSION_KEY);
  // Also wipe the old legacy key if still present
  if (stored === null) {
    await AsyncStorage.removeItem(ONBOARDING_OLD_KEY);
  }
  return stored !== APP_VERSION;
}
