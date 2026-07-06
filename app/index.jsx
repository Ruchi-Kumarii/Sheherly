import { useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Onboarding, { shouldShowOnboarding } from "../components/Onboarding";
import { LAST_USER_KEY, CACHED_PROFILE_KEY } from "../constants/storageKeys";

const logo = require("../assets/images/sheherlyTitle.png");

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      // ── Step 0: Always check onboarding first ──
      const needsOnboarding = await shouldShowOnboarding();
      if (needsOnboarding) {
        setShowOnboarding(true);
        setChecking(false);
        return;
      }

      // ── Step 1: Check AsyncStorage FIRST (instant, no network needed) ──
      // If we have a saved UID, the user was signed in last session.
      // Send them straight to home regardless of network state.
      const lastUid = await AsyncStorage.getItem(LAST_USER_KEY);
      if (lastUid) {
        setRedirecting(true);
        router.replace("/home");
        return;
      }

      // ── Step 2: No saved session — check network then Firebase ──
      const net = await NetInfo.fetch();
      const isOnline = net.isConnected && net.isInternetReachable !== false;

      if (!isOnline) {
        // Offline and no saved session → show welcome page
        setChecking(false);
        return;
      }

      // ── Step 3: Online, no cached session — check Firebase auth state ──
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          // Save UID and profile for future offline use
          await AsyncStorage.setItem(LAST_USER_KEY, user.uid);
          try {
            const snap = await getDoc(doc(db, "users", user.uid));
            if (snap.exists()) {
              await AsyncStorage.setItem(
                CACHED_PROFILE_KEY,
                JSON.stringify({ uid: user.uid, email: user.email, ...snap.data() })
              );
            } else {
              await AsyncStorage.setItem(
                CACHED_PROFILE_KEY,
                JSON.stringify({ uid: user.uid, email: user.email })
              );
            }
          } catch (_) {}
          setRedirecting(true);
          router.replace("/home");
        } else {
          // No Firebase user — show welcome page
          setChecking(false);
        }
      });
    };

    bootstrap();
  }, []);

  if (redirecting) return null;

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <ActivityIndicator size="large" color="#218fb4" />
      </View>
    );
  }

  if (showOnboarding) {
    return <Onboarding onDone={() => setShowOnboarding(false)} />;
  }

  const handleGuestUser = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      router.replace("/home");
    } catch (error) {
      console.log("Guest login error:", error);
      router.replace("/home");
    }
  };

  return (
    <SafeAreaView className="bg-[white] flex-1">
      <StatusBar barStyle={"dark-content"} backgroundColor={"white"} />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 m-2 justify-center items-center">
          <Image source={logo} style={{ width: 300, height: 300 }} />

          <View className="w-3/4">
            <TouchableOpacity
              onPress={() => router.push("/signup")}
              className="p-2 my-2 bg-[#218fb4ff] rounded-lg"
            >
              <Text className="text-lg font-semibold text-center text-white">
                Sign Up
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleGuestUser}
              className="p-2 my-2 bg-white border border-[#218fb4ff] rounded-lg"
            >
              <Text className="text-lg font-semibold text-center text-[#218fb4ff]">
                Guest User
              </Text>
            </TouchableOpacity>
          </View>

          <View>
            <TouchableOpacity
              className="p-2 flex flex-row justify-center items-center"
              onPress={() => router.push("/signin")}
            >
              <Text className="font-semibold">Already a User?</Text>
              <Text className="text-base font-semibold text-center text-[#218fb4ff]">
                {" "}
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
