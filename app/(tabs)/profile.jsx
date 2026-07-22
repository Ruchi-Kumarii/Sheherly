import { View, Text, ScrollView, TouchableOpacity, Image, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { LAST_USER_KEY, CACHED_PROFILE_KEY } from "../../constants/storageKeys";
import Toast from "../../components/Toast";
import * as Haptics from "expo-haptics";

const settingsOptions = [
  { id: "1", title: "Edit Profile", route: "edit", needsOnline: true },
  { id: "2", title: "Change Password", route: "change-password", needsOnline: true },
  { id: "3", title: "Saved Places", route: "/(tabs)/offline", needsOnline: false },
  { id: "5", title: "Send Feedback", route: "feedback", needsOnline: false },
  { id: "6", title: "Delete Account", route: "delete-account", needsOnline: true },
  { id: "7", title: "Logout", route: "logout", danger: true, needsOnline: false },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });
  const router = useRouter();
  const { isOnline } = useNetworkStatus();

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    let unsubscribe = () => {};

    const loadProfile = async () => {
      setLoading(true);

      if (!isOnline) {
        // Fully offline — load from AsyncStorage cache only, never touch Firebase
        try {
          const cached = await AsyncStorage.getItem(CACHED_PROFILE_KEY);
          if (cached) {
            setUser(JSON.parse(cached));
          } else {
            setUser(null);
          }
        } catch (_) {
          setUser(null);
        }
        setLoading(false);
        return;
      }

      // Online — use Firebase auth listener
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          // Firebase says no user — but double-check cache before showing Guest
          // (handles brief network blips where Firebase resolves before network is stable)
          try {
            const cached = await AsyncStorage.getItem(CACHED_PROFILE_KEY);
            if (cached) {
              setUser(JSON.parse(cached));
              setLoading(false);
              return;
            }
          } catch (_) {}
          setUser(null);
          setLoading(false);
          return;
        }
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          const profileData = snap.exists()
            ? { uid: firebaseUser.uid, email: firebaseUser.email, ...snap.data() }
            : { uid: firebaseUser.uid, email: firebaseUser.email };
          setUser(profileData);
          // Keep cache fresh
          await AsyncStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(profileData));
        } catch (err) {
          console.log("PROFILE FETCH ERROR:", err);
          // Network error — fall back to cache
          try {
            const cached = await AsyncStorage.getItem(CACHED_PROFILE_KEY);
            if (cached) setUser(JSON.parse(cached));
          } catch (_) {}
        } finally {
          setLoading(false);
        }
      });
    };

    loadProfile();
    return () => unsubscribe();
  }, [isOnline]);

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
      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Offline banner */}
        {!isOnline && (
          <View style={{
            backgroundColor: "#fff7ed",
            borderColor: "#fb923c",
            borderWidth: 1,
            marginHorizontal: 16,
            marginTop: 12,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}>
            <Text style={{ fontSize: 18 }}>📡</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#9a3412", fontWeight: "700", fontSize: 13 }}>
                No Internet Connection
              </Text>
              <Text style={{ color: "#c2410c", fontSize: 12, marginTop: 2 }}>
                Profile is read-only. Only Saved Places works offline.
              </Text>
            </View>
          </View>
        )}

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
          {!isOnline && !isGuest && (
            <Text className="text-xs text-orange-500 mt-1">Viewing cached profile</Text>
          )}
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
                        onPress={() => {
                          if (!isOnline) {
                            showToast("Internet required to edit profile", "error");
                            return;
                          }
                          item.label === "Email"
                            ? router.push("/signin")
                            : router.push("/profile/edit");
                        }}
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
          <View className="mx-6 mb-10">
            <Text className="text-base font-bold text-gray-800 mb-3">Settings</Text>
            {settingsOptions.map((option) => {
              const isExternal = option.route.startsWith("/");
              const isDisabledOffline = !isOnline && option.needsOnline;

              return (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={isDisabledOffline ? 1 : 0.8}
                  onPress={() => {
                    if (isDisabledOffline) {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                      showToast("Internet required for this action", "error");
                      return;
                    }
                    Haptics.selectionAsync();
                    isExternal
                      ? router.push(option.route)
                      : router.push(`/profile/${option.route}`);
                  }}
                  className={`flex-row items-center p-4 rounded-2xl mb-4 shadow ${
                    option.danger
                      ? "bg-red-50"
                      : isDisabledOffline
                      ? "bg-gray-100"
                      : "bg-white"
                  }`}
                >
                  {option.icon && (
                    <Text style={{ fontSize: 18, marginRight: 10 }}>{option.icon}</Text>
                  )}
                  <Text
                    className={`flex-1 text-base font-semibold ${
                      option.danger
                        ? "text-red-600"
                        : isDisabledOffline
                        ? "text-gray-400"
                        : "text-gray-800"
                    }`}
                  >
                    {option.title}
                  </Text>
                  {isDisabledOffline ? (
                    <Text className="text-xs text-orange-400 font-medium">🔒 Offline</Text>
                  ) : (
                    <Text className="text-gray-400 text-xl">›</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Customer Support Footer */}
        <View className="mx-6 mb-10">
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 20,
              shadowColor: "#64748b",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <Text style={{ fontSize: 22, marginRight: 10 }}>💬</Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b" }}>
                Need Help?
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: "#64748b", lineHeight: 20, marginBottom: 16 }}>
              Have questions or need support? Email us and our team will get back to you within 24 hours.
            </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                Linking.openURL("mailto:kiro21223@gmail.com?subject=Sheherly Support Request");
              }}
              style={{
                backgroundColor: "#218fb4",
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 18 }}>📧</Text>
              <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>
                kiro21223@gmail.com
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
