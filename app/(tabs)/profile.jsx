import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

const settingsOptions = [
  { id: "1", title: "Edit Profile", route: "edit" },
  { id: "2", title: "Change Password", route: "change-password" },
  { id: "3", title: "Saved Places", route: "/(tabs)/offline" },
  { id: "4", title: "Delete Account", route: "delete-account" },
  { id: "5", title: "Logout", route: "logout", danger: true },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // onAuthStateChanged is the only reliable way to detect logout
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) {
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...snap.data() });
        } else {
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
        }
      } catch (err) {
        console.log("PROFILE FETCH ERROR:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe; // cleanup listener on unmount
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  const isGuest = !user;

  const profileSections = isGuest
    ? []
    : [
        {
          title: "Personal Details",
          items: [
            { label: "Name", value: String(user?.name || "Add name") },
            { label: "Email", value: String(user?.email || "Add email") },
            { label: "Phone", value: String(user?.phone || "Add phone number") },
          ],
        },
      ];

  return (
    <SafeAreaView className="flex-1 bg-[#f6f7fb]">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View className="items-center mt-8 mb-6">
          <View className="w-24 h-24 rounded-full bg-blue-200 items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={{ width: 96, height: 96 }} />
            ) : (
              <Text className="text-5xl">👤</Text>
            )}
          </View>
          <Text className="text-lg font-semibold mt-3 text-gray-800">
            {isGuest ? "Guest User" : user?.name || "User"}
          </Text>
        </View>

        {/* Profile Details */}
        <View className="mx-6">
          {profileSections.map((section, index) => (
            <View key={index} className="bg-white rounded-2xl p-4 mb-5 shadow">
              <Text className="text-base font-bold text-gray-800 mb-3">
                {section.title}
              </Text>
              {section.items.map((item, i) => {
                const valueStr = String(item.value);
                const isAdd = valueStr.startsWith("Add");
                return (
                  <View
                    key={i}
                    className="flex-row justify-between py-2 border-b border-gray-100"
                  >
                    <Text className="text-sm text-gray-500">{item.label}</Text>
                    {isAdd ? (
                      <TouchableOpacity
                        onPress={() =>
                          item.label === "Email"
                            ? router.push("/signin")
                            : router.push("/profile/edit")
                        }
                      >
                        <Text className="text-sm font-semibold text-blue-500">{valueStr}</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text className="text-sm font-semibold text-gray-800">{valueStr}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Guest — Sign In / Sign Up buttons */}
        {isGuest && (
          <View className="mx-6 mb-6">
            <Text className="text-sm text-gray-500 text-center mb-4">
              Sign in to access your profile, save locations, and more.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/signin")}
              className="bg-[#218fb4] p-4 rounded-2xl items-center mb-3 shadow"
            >
              <Text className="text-white text-base font-semibold">Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/signup")}
              className="bg-white border border-[#218fb4] p-4 rounded-2xl items-center shadow"
            >
              <Text className="text-[#218fb4] text-base font-semibold">Create Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings */}
        {!isGuest && (
          <View className="mx-6">
            <Text className="text-base font-bold text-gray-800 mb-3">Settings</Text>
            {settingsOptions.map((option) => {
              const isExternal = option.route.startsWith("/");
              const content = (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={0.8}
                  onPress={() =>
                    isExternal
                      ? router.push(option.route)
                      : router.push(`/profile/${option.route}`)
                  }
                  className={`flex-row items-center p-4 rounded-2xl mb-4 shadow ${
                    option.danger ? "bg-red-50" : "bg-white"
                  }`}
                >
                  <Text className="text-2xl mr-4">{option.emoji}</Text>
                  <Text
                    className={`flex-1 text-base font-semibold ${
                      option.danger ? "text-red-600" : "text-gray-800"
                    }`}
                  >
                    {option.title}
                  </Text>
                  <Text className="text-gray-400 text-xl">›</Text>
                </TouchableOpacity>
              );
              return content;
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
