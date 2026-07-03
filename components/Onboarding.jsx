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

const APP_VERSION = "1.0.2";
const ONBOARDING_VERSION_KEY = "sheherly_onboarding_version";
const ONBOARDING_OLD_KEY = "sheherly_onboarding_done";

const slides = [
  {
    id: "1",
    image: require("../assets/images/intro1.png"),
    title: "Explore Jaipur\nLike a Local",
    subtitle: "Discover the best food, stays, transport,\nand hidden gems — all in one app.",
    accent: "#085a73",
    bg: "#f0ece6ff",   // beige/cream — matches intro1.png
  },
  {
    id: "2",
    image: require("../assets/images/intro2.png"),
    title: "",
    subtitle: "But Sheherly is with you!",
    accent: "#3485a0ff",
    bg: "#dce0e4ff",   // light teal — matches intro2.png
  },
  {
    id: "3",
    image: require("../assets/images/intro3.png"),
    title: "",
    subtitle: "Find the perfect accommodation — from\nbudget hostels to cozy flats — near you.",
    accent: "#085a73",
    bg: "#d1eaedff",   // light teal — matches intro3.png
  },
];

export default function Onboarding({ onDone }) {
  const [current, setCurrent] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const slide = slides[current];

  const finish = async () => {
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
    <Image
      source={item.image}
      style={{ width, height }}
      resizeMode="cover"
    />
  );

  return (
    <View style={[styles.root, { backgroundColor: slide.bg }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Full screen image pager */}
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
        style={StyleSheet.absoluteFill}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Skip button only — top right, no app name */}
      {current < slides.length - 1 && (
        <TouchableOpacity
          onPress={finish}
          style={styles.skipBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Bottom overlay — NO background color, text + button float on image */}
      <View style={styles.bottom}>
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

        {/* Button */}
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
  skipBtn: {
    position: "absolute",
    top: 48,
    right: 24,
    zIndex: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  /* Bottom section — transparent, floats over image */
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingBottom: 40,
    paddingTop: 20,
    gap: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 10,
    color: "#374151",
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

export async function shouldShowOnboarding() {
  const stored = await AsyncStorage.getItem(ONBOARDING_VERSION_KEY);
  if (stored === null) {
    await AsyncStorage.removeItem(ONBOARDING_OLD_KEY);
  }
  return stored !== APP_VERSION;
}
