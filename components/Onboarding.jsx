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
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const ONBOARDING_KEY = "sheherly_onboarding_done";

const slides = [
  {
    id: "1",
    image: require("../assets/images/intro1.png"),
    title: "Explore Jaipur Like a Local",
    subtitle:
      "Discover the best food, stays, transport, and hidden gems — all in one app.",
    accent: "#085a73",
    bg: "#e8f4f8",
  },
  {
    id: "2",
    image: require("../assets/images/intro2.png"),
    title: "PG? Flat? Hostel?\nI got you homie!",
    subtitle:
      "Find the perfect accommodation — from budget hostels to cozy flats — near you.",
    accent: "#218fb4",
    bg: "#eef6fa",
  },
  {
    id: "3",
    image: require("../assets/images/intro3.png"),
    title: "Your AI Guide to the City",
    subtitle:
      "Ask our chatbot anything about Jaipur — routes, timings, tips and more.",
    accent: "#085a73",
    bg: "#e8f4f8",
  },
];

export default function Onboarding({ onDone }) {
  const [current, setCurrent] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
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
      setCurrent(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const slide = slides[current];

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { width, backgroundColor: item.bg }]}>
      {/* Illustration area */}
      <View style={styles.illustrationContainer}>
        <Image
          source={item.image}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: slide.bg }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* App name at top */}
      <View style={styles.topBar}>
        <Text style={[styles.appName, { color: slide.accent }]}>Sheherly</Text>
        {current < slides.length - 1 && (
          <TouchableOpacity onPress={finish} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: slide.accent }]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Swipeable slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        style={styles.flatList}
      />

      {/* Bottom card */}
      <View style={styles.bottomCard}>
        {/* Text content */}
        <Text style={[styles.title, { color: slide.accent }]}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
              extrapolate: "clamp",
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: slide.accent,
                  },
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

const BOTTOM_HEIGHT = height * 0.38;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    zIndex: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "600",
  },
  flatList: {
    flex: 1,
    marginBottom: BOTTOM_HEIGHT,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationContainer: {
    width: width * 0.82,
    height: height * 0.46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
  bottomCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_HEIGHT,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 12,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
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
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

// Helper to check if onboarding is needed
export async function shouldShowOnboarding() {
  const done = await AsyncStorage.getItem(ONBOARDING_KEY);
  return !done;
}
