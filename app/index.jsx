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
import { auth } from "../firebase";
import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
const logo = require("../assets/images/sheherlyTitle.png");

const LAST_USER_KEY = "sheherly_last_user_uid";

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      // Check network first
      const net = await NetInfo.fetch();
      const isOnline = net.isConnected && net.isInternetReachable !== false;

      if (!isOnline) {
        const lastUid = await AsyncStorage.getItem(LAST_USER_KEY);
        if (lastUid) {
          setRedirecting(true);
          router.replace("/home");
        } else {
          setChecking(false);
        }
        return;
      }

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          await AsyncStorage.setItem(LAST_USER_KEY, user.uid);
          setRedirecting(true);
          router.replace("/home");
        } else {
          await AsyncStorage.removeItem(LAST_USER_KEY);
          setChecking(false);
        }
      });
    };

    bootstrap();
  }, []);

  // Show nothing while redirecting (no flash)
  if (redirecting) return null;

  // Show spinner only while checking
  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <ActivityIndicator size="large" color="#218fb4" />
      </View>
    );
  }

  const handleGuestUser = async () => {
    try {
      // Sign out of Firebase so profile shows as guest
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