import { useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";

const logo = require("../../assets/images/sheherlyTitle.png");

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    const trimmed = email.trim().toLowerCase();
    setError("");

    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmed);
      setSent(true);
    } catch (err) {
      console.log("RESET ERROR:", err.code);
      if (err.code === "auth/user-not-found") {
        // Don't reveal whether email exists — show success anyway (security best practice)
        setSent(true);
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please wait a few minutes and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="m-2 flex justify-center items-center">

          <Image source={logo} style={{ width: 300, height: 220 }} />

          <View className="w-5/6">

            {sent ? (
              // ── Success state ──────────────────────────────────────────────
              <View className="items-center mt-4">
                <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-4">
                  <Text className="text-4xl">✅</Text>
                </View>

                <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
                  Check your email
                </Text>

                <Text className="text-sm text-gray-500 text-center leading-5 mb-8 px-4">
                  If an account exists for{" "}
                  <Text className="font-semibold text-gray-700">{email.trim()}</Text>
                  , a password reset link has been sent. Check your inbox (and spam folder).
                </Text>

                <TouchableOpacity
                  onPress={() => router.replace("/signin")}
                  className="w-full bg-[#218fb4] py-3 rounded-lg mb-3"
                >
                  <Text className="text-white text-center text-base font-semibold">
                    Back to Sign In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => { setSent(false); setEmail(""); }}
                  className="w-full border border-[#218fb4] py-3 rounded-lg"
                >
                  <Text className="text-[#218fb4] text-center text-base font-semibold">
                    Try a different email
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // ── Input state ────────────────────────────────────────────────
              <View className="w-full">

                <Text className="text-2xl font-bold text-gray-800 mt-2 mb-1">
                  Forgot Password?
                </Text>
                <Text className="text-sm text-gray-500 mb-6">
                  Enter the email you signed up with and we'll send you a reset link.
                </Text>

                <Text className="text-[#218fb4] mb-2 font-medium">Email</Text>
                <TextInput
                  className="h-11 border border-[#218fb4] bg-white text-gray-800 rounded-lg px-3"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="you@example.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(""); }}
                  onSubmitEditing={handleReset}
                  returnKeyType="done"
                />

                {error ? (
                  <Text className="text-red-500 text-xs mt-2">{error}</Text>
                ) : null}

                <TouchableOpacity
                  onPress={handleReset}
                  disabled={loading}
                  className="py-3 mt-6 bg-[#218fb4] rounded-lg"
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white text-base font-semibold text-center">
                      Send Reset Link
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.back()}
                  className="mt-4 py-3 border border-gray-200 rounded-lg"
                >
                  <Text className="text-gray-500 text-base text-center font-medium">
                    ← Back to Sign In
                  </Text>
                </TouchableOpacity>

              </View>
            )}

          </View>
        </View>

        <StatusBar barStyle="light-content" backgroundColor="grey" />
      </ScrollView>
    </SafeAreaView>
  );
}
