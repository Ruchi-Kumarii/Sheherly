import { useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
const logo = require("../assets/images/sheherlyTitle.png");

export default function Index() {
  const router = useRouter();

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