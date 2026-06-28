import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

/**
 * Usage:
 *   <Toast message="Profile updated ✅" visible={showToast} onHide={() => setShowToast(false)} />
 */
export default function Toast({ message, visible, onHide, type = "success" }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 20, duration: 300, useNativeDriver: true }),
        ]).start(() => onHide?.());
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const bgColor = type === "error" ? "#ef4444" : type === "warning" ? "#f97316" : "#085a73";

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 100,
        left: 24,
        right: 24,
        zIndex: 999,
        opacity,
        transform: [{ translateY }],
      }}
    >
      <View
        style={{
          backgroundColor: bgColor,
          borderRadius: 14,
          paddingHorizontal: 18,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text style={{ color: "white", fontSize: 14, fontWeight: "600", flex: 1 }}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
