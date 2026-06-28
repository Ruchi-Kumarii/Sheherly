import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

function SkeletonBox({ width, height, borderRadius = 8, style }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#d1d5db",
          opacity,
        },
        style,
      ]}
    />
  );
}

// Card skeleton — matches the listing card style in food/medical/etc.
export function ListingCardSkeleton() {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <SkeletonBox width="60%" height={18} borderRadius={6} />
        <SkeletonBox width={40} height={18} borderRadius={6} />
      </View>
      <SkeletonBox width="45%" height={13} borderRadius={4} style={{ marginTop: 10 }} />
      <SkeletonBox width="35%" height={13} borderRadius={4} style={{ marginTop: 6 }} />
      <SkeletonBox width="100%" height={36} borderRadius={10} style={{ marginTop: 12 }} />
    </View>
  );
}

// Category row skeleton — for index pages like food/index
export function CategoryRowSkeleton() {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <SkeletonBox width={48} height={48} borderRadius={12} style={{ marginRight: 14 }} />
      <View style={{ flex: 1 }}>
        <SkeletonBox width="50%" height={16} borderRadius={5} />
        <SkeletonBox width="70%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}
