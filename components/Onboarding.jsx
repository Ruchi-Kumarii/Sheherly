import { useEffect, useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, Dimensions,
  Animated, StyleSheet, StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const APP_VERSION = "1.0.4";  // bumped to force re-show on existing installs
const ONBOARDING_VERSION_KEY = "sheherly_onboarding_version";
const ONBOARDING_OLD_KEY = "sheherly_onboarding_done";
const SCENE_DURATION = 3000;
const FADE_DURATION = 400;
const SCENES = [0, 1, 2, 3, 4, 5, 6];

// ── Scene 0: Hook — "New in city?" ───────────────────────────────────────────
function Scene0({ anim }) {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -8, duration: 500, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0,  duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const questions = ["Where to eat? 🍽️", "Safe area? 🏘️", "Bus or auto? 🚌", "Any good PG? 🏠"];

  return (
    <Animated.View style={[styles.scene, { opacity: anim, backgroundColor: "#062430" }]}>
      {/* Floating question marks */}
      <View style={styles.s0QRow}>
        {["?", "?", "?"].map((q, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.s0QMark,
              { transform: [{ translateY: bounce }], opacity: 0.15 + i * 0.2, fontSize: 40 + i * 14 },
            ]}
          >
            {q}
          </Animated.Text>
        ))}
      </View>

      {/* Main hook text */}
      <Text style={styles.s0Hook}>New in city?</Text>
      <Text style={styles.s0Sub}>Struggle is real.</Text>

      {/* Floating pain points */}
      <View style={styles.s0Tags}>
        {questions.map((q, i) => (
          <View key={i} style={styles.s0Tag}>
            <Text style={styles.s0TagText}>{q}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.s0Teaser}>We got you 👇</Text>
    </Animated.View>
  );
}

function Scene1({ anim }) {
  return (
    <Animated.View style={[styles.scene, { opacity: anim, backgroundColor: "#EEF5F5" }]}>
      <View style={styles.s1Arch}>
        <View style={styles.s1ArchOuter} />
        <View style={styles.s1ArchInner} />
        <View style={styles.s1Pin}>
          <View style={styles.s1PinHead} />
          <View style={styles.s1PinTip} />
        </View>
      </View>
      <Text style={styles.s1Word}>Sheherly</Text>
      <Text style={styles.s1Tag}>Jaipur, in your pocket.</Text>
    </Animated.View>
  );
}

function Scene2({ anim }) {
  const features = [
    { emoji: "🍽️", label: "Food" }, { emoji: "🏨", label: "Stays" },
    { emoji: "🚌", label: "Transport" }, { emoji: "🏥", label: "Hospitals" },
    { emoji: "🛍️", label: "Markets" }, { emoji: "🏯", label: "Landmarks" },
  ];
  return (
    <Animated.View style={[styles.scene, { opacity: anim, backgroundColor: "#EEF5F5" }]}>
      <Text style={styles.eyebrow}>All in one place</Text>
      <Text style={styles.headline}>Food, stays, transport{"\n"}& more — sorted</Text>
      <View style={styles.s2Grid}>
        {features.map((f) => (
          <View key={f.label} style={styles.s2Cell}>
            <View style={styles.s2Badge}><Text style={styles.s2Emoji}>{f.emoji}</Text></View>
            <Text style={styles.s2Label}>{f.label}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

function Scene3({ anim }) {
  return (
    <Animated.View style={[styles.scene, { opacity: anim, backgroundColor: "#EEF5F5" }]}>
      <Text style={styles.headline}>Ask, and get{"\n"}local answers</Text>
      <View style={styles.s3Chat}>
        <View style={styles.s3UserBubble}>
          <Text style={styles.s3UserText}>Best street food nearby?</Text>
        </View>
        <View style={styles.s3AiBubble}>
          <View style={styles.s3Avatar}><Text style={{ fontSize: 9, color: "#fff" }}>✦</Text></View>
          <Text style={styles.s3AiText}>3 spots within 5 min walk — rated 4.6★ and up.</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function Scene4({ anim, routeAnim }) {
  const routeWidth = routeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, width * 0.55] });
  return (
    <Animated.View style={[styles.scene, { opacity: anim, backgroundColor: "#EEF5F5" }]}>
      <Text style={styles.eyebrow}>Live map</Text>
      <Text style={styles.headline}>Get there — walking,{"\n"}driving or cycling</Text>
      <View style={styles.s4MapCard}>
        {[50, 110, 160].map((y) => <View key={y} style={[styles.s4GridH, { top: y }]} />)}
        {[60, 150, 230].map((x) => <View key={x} style={[styles.s4GridV, { left: x }]} />)}
        <View style={styles.s4DotA} />
        <View style={styles.s4DotB} />
        <Animated.View style={[styles.s4RouteLine, { width: routeWidth }]} />
      </View>
      <View style={styles.s4Pills}>
        {["🚶", "🚴", "🚗"].map((m, i) => (
          <View key={i} style={[styles.s4Pill, i === 0 && styles.s4PillActive]}>
            <Text style={{ fontSize: 18 }}>{m}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

function Scene5({ anim }) {
  const items = ["🍽️  Sarafa Bazaar Night Food", "🏨  Moustache Hostel Jaipur", "🏥  SMS Hospital"];
  return (
    <Animated.View style={[styles.scene, { opacity: anim, backgroundColor: "#EEF5F5" }]}>
      <Text style={styles.eyebrow}>Always with you</Text>
      <Text style={styles.headline}>No signal?{"\n"}No problem.</Text>
      {items.map((item, i) => (
        <View key={i} style={styles.s5Card}>
          <Text style={styles.s5CardText}>{item}</Text>
        </View>
      ))}
      <View style={styles.s5Badge}>
        <Text style={styles.s5BadgeText}>📴  Saved listings work offline</Text>
      </View>
    </Animated.View>
  );
}

function Scene6({ anim, onDone }) {
  return (
    <Animated.View style={[styles.scene, { opacity: anim, backgroundColor: "#062430" }]}>
      <View style={styles.s6Stars}>
        {[30, 80, 140, 200, 255].map((x, i) => (
          <View key={i} style={[styles.s6Star, { left: x, top: 10 + (i % 2) * 16 }]} />
        ))}
      </View>
      <View style={styles.s6Skyline}>
        {[{ w: 36, h: 85 }, { w: 48, h: 115 }, { w: 36, h: 75 }, { w: 42, h: 105 }, { w: 36, h: 72 }].map((b, i) => (
          <View key={i} style={[styles.s6Building, { width: b.w, height: b.h }]} />
        ))}
      </View>
      <View style={styles.s6Pin}>
        <View style={styles.s6PinHead} />
        <View style={styles.s6PinTip} />
      </View>
      <Text style={styles.s6Word}>Sheherly</Text>
      <Text style={styles.s6Tag}>EXPLORE LIKE A LOCAL</Text>
      <TouchableOpacity style={styles.s6Cta} onPress={onDone} activeOpacity={0.85}>
        <Text style={styles.s6CtaText}>Start exploring  →</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Onboarding({ onDone }) {
  const [scene, setScene] = useState(0);
  const sceneAnims = useRef(SCENES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;
  const routeAnim = useRef(new Animated.Value(0)).current;

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_VERSION_KEY, APP_VERSION);
    await AsyncStorage.removeItem(ONBOARDING_OLD_KEY);
    onDone?.();
  };

  useEffect(() => {
    let cur = 0;
    const runScene = () => {
      const next = cur + 1;
      if (next >= SCENES.length) return;
      if (next === 4) {
        routeAnim.setValue(0);
        Animated.timing(routeAnim, { toValue: 1, duration: SCENE_DURATION - 500, useNativeDriver: false }).start();
      }
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(sceneAnims[cur],  { toValue: 0, duration: FADE_DURATION, useNativeDriver: true }),
          Animated.timing(sceneAnims[next], { toValue: 1, duration: FADE_DURATION, useNativeDriver: true }),
        ]).start(() => { cur = next; setScene(cur); runScene(); });
      }, SCENE_DURATION);
    };
    runScene();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Scene0 anim={sceneAnims[0]} />
      <Scene1 anim={sceneAnims[1]} />
      <Scene2 anim={sceneAnims[2]} />
      <Scene3 anim={sceneAnims[3]} />
      <Scene4 anim={sceneAnims[4]} routeAnim={routeAnim} />
      <Scene5 anim={sceneAnims[5]} />
      <Scene6 anim={sceneAnims[6]} onDone={finish} />
      <View style={styles.dots}>
        {SCENES.map((_, i) => (
          <View key={i} style={[styles.dot, scene === i && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

export async function shouldShowOnboarding() {
  const stored = await AsyncStorage.getItem(ONBOARDING_VERSION_KEY);
  if (stored === null) await AsyncStorage.removeItem(ONBOARDING_OLD_KEY);
  return stored !== APP_VERSION;
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: "#062430" },
  scene: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", padding: 32 },
  eyebrow:  { fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", color: "#0E7C90", marginBottom: 8 },
  headline: { fontSize: 22, fontWeight: "800", color: "#0C242C", textAlign: "center", lineHeight: 30, marginBottom: 24 },
  // Scene 0 — Hook
  s0QRow:    { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 24, opacity: 0.6 },
  s0QMark:   { color: "#2FA9A6", fontWeight: "900" },
  s0Hook:    { fontSize: 36, fontWeight: "900", color: "#fff", textAlign: "center", lineHeight: 44 },
  s0Sub:     { fontSize: 18, fontWeight: "600", color: "#2FA9A6", textAlign: "center", marginTop: 8, marginBottom: 28 },
  s0Tags:    { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 28 },
  s0Tag:     { backgroundColor: "rgba(47,169,166,0.15)", borderWidth: 1, borderColor: "rgba(47,169,166,0.4)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  s0TagText: { color: "#8FE3D8", fontSize: 13, fontWeight: "600" },
  s0Teaser:  { fontSize: 15, color: "rgba(255,255,255,0.5)", fontWeight: "500" },
  // Scene 1
  s1Arch:      { width: 130, height: 150, alignItems: "center", justifyContent: "flex-end", marginBottom: 20 },
  s1ArchOuter: { position: "absolute", bottom: 0, width: 120, height: 130, borderTopLeftRadius: 60, borderTopRightRadius: 60, borderWidth: 7, borderBottomWidth: 0, borderColor: "#075872" },
  s1ArchInner: { position: "absolute", bottom: 0, width: 84, height: 100, borderTopLeftRadius: 42, borderTopRightRadius: 42, borderWidth: 4, borderBottomWidth: 0, borderColor: "#2FA9A6", opacity: 0.55 },
  s1Pin:       { position: "absolute", top: 8, alignItems: "center" },
  s1PinHead:   { width: 24, height: 24, borderRadius: 12, backgroundColor: "#C9714B" },
  s1PinTip:    { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 10, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "#C9714B" },
  s1Word:      { fontSize: 34, fontWeight: "800", color: "#075872", letterSpacing: -0.5 },
  s1Tag:       { fontSize: 14, color: "#3E5A61", marginTop: 6 },
  // Scene 2
  s2Grid:  { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", width: "100%", gap: 16 },
  s2Cell:  { width: "28%", alignItems: "center", gap: 6 },
  s2Badge: { width: 56, height: 56, borderRadius: 18, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 4 },
  s2Emoji: { fontSize: 24 },
  s2Label: { fontSize: 11.5, fontWeight: "600", color: "#3E5A61" },
  // Scene 3
  s3Chat:       { width: "100%", gap: 12 },
  s3UserBubble: { alignSelf: "flex-end", backgroundColor: "#075872", borderRadius: 16, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: "78%" },
  s3UserText:   { color: "#fff", fontSize: 13, lineHeight: 18 },
  s3AiBubble:   { alignSelf: "flex-start", flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, borderBottomLeftRadius: 4, paddingHorizontal: 12, paddingVertical: 10, maxWidth: "78%", gap: 8, elevation: 3 },
  s3Avatar:     { width: 20, height: 20, borderRadius: 10, backgroundColor: "#2FA9A6", alignItems: "center", justifyContent: "center" },
  s3AiText:     { fontSize: 13, color: "#0C242C", lineHeight: 18, flex: 1 },
  // Scene 4
  s4MapCard:    { width: "100%", height: 190, borderRadius: 22, backgroundColor: "#0c5266", overflow: "hidden", marginBottom: 20 },
  s4GridH:      { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "#0f6478", opacity: 0.4 },
  s4GridV:      { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "#0f6478", opacity: 0.4 },
  s4DotA:       { position: "absolute", bottom: 28, left: 36, width: 14, height: 14, borderRadius: 7, backgroundColor: "#8FE3D8" },
  s4DotB:       { position: "absolute", top: 22, right: 36, width: 14, height: 14, borderRadius: 7, backgroundColor: "#C9714B" },
  s4RouteLine:  { position: "absolute", bottom: 34, left: 43, height: 3, backgroundColor: "#8FE3D8", borderRadius: 2 },
  s4Pills:      { flexDirection: "row", backgroundColor: "#fff", borderRadius: 999, padding: 6, gap: 4, elevation: 4 },
  s4Pill:       { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  s4PillActive: { backgroundColor: "#075872" },
  // Scene 5
  s5Card:     { width: "100%", backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, elevation: 3 },
  s5CardText: { fontSize: 14, color: "#0C242C", fontWeight: "500" },
  s5Badge:    { marginTop: 8, backgroundColor: "#075872", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 },
  s5BadgeText:{ color: "#fff", fontSize: 12, fontWeight: "700" },
  // Scene 6
  s6Stars:    { position: "absolute", top: 40, left: 0, right: 0, height: 60 },
  s6Star:     { position: "absolute", width: 5, height: 5, borderRadius: 3, backgroundColor: "#8FE3D8" },
  s6Skyline:  { position: "absolute", bottom: 0, flexDirection: "row", alignItems: "flex-end", gap: 6, paddingHorizontal: 16 },
  s6Building: { backgroundColor: "#08475a", borderTopLeftRadius: 4, borderTopRightRadius: 4, borderTopWidth: 2, borderColor: "#0E7C90" },
  s6Pin:      { alignItems: "center", marginBottom: 8, zIndex: 2 },
  s6PinHead:  { width: 28, height: 28, borderRadius: 14, backgroundColor: "#C9714B" },
  s6PinTip:   { width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 12, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "#C9714B" },
  s6Word:     { fontSize: 34, fontWeight: "800", color: "#fff", letterSpacing: -0.5, zIndex: 2 },
  s6Tag:      { fontSize: 12, fontWeight: "600", color: "#2FA9A6", letterSpacing: 3, marginTop: 6, zIndex: 2 },
  s6Cta:      { marginTop: 28, backgroundColor: "#C9714B", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 999, zIndex: 2 },
  s6CtaText:  { color: "#fff", fontSize: 14, fontWeight: "700" },
  // Dots
  dots:      { position: "absolute", bottom: 28, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6, zIndex: 50 },
  dot:       { width: 8, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.25)" },
  dotActive: { width: 22, backgroundColor: "#2FA9A6" },
});
