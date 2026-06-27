import { useRouter, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import { Image, ScrollView, StatusBar, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput } from "react-native";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import validationSchema from "../../utils/authSchema";

const logo = require("../../assets/images/sheherlyTitle.png");

const Signin = () => {
  const router = useRouter();
  const { registered } = useLocalSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const handleSignin = async (values) => {
    try {
      const { user } = await signInWithEmailAndPassword(
        auth,
        values.email.trim().toLowerCase(),
        values.password
      );

      // Pull user record from Firestore
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? snap.data() : {};

      // Block suspended users before they get in
      if (data.suspended) {
        await signOut(auth);
        Alert.alert(
          "Account Suspended",
          "Your account has been suspended. Please contact the admin for assistance.",
          [{ text: "OK" }]
        );
        return;
      }

      // Block blocked users
      if (data.blocked) {
        await signOut(auth);
        Alert.alert(
          "Account Blocked",
          "Your account has been blocked. Please contact the admin for assistance.",
          [{ text: "OK" }]
        );
        return;
      }

      if (data.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/home");
      }
    } catch (err) {
      console.log("SIGNIN ERROR:", err.code);
      const messages = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/invalid-credential": "Invalid email or password.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/invalid-email": "Please enter a valid email address.",
      };
      Alert.alert("Sign In Failed", messages[err.code] || "Something went wrong.");
    }
  };

  return (
    <SafeAreaView className="bg-white">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="m-2 flex justify-center items-center">
          <Image source={logo} style={{ width: 300, height: 220 }} />

          <View className="w-5/6">
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSignin}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View className="w-full">

                  {registered === "1" && (
                    <View className="bg-green-50 border border-green-400 rounded-lg px-3 py-3 mb-2 mt-2">
                      <Text className="text-green-700 text-sm text-center font-medium">
                        Account created! Check your email for the password, then sign in.
                      </Text>
                    </View>
                  )}

                  <Text className="text-[#218fb4] mt-4 mb-2">Email</Text>
                  <TextInput
                    className="h-10 border border-[#218fb4] bg-white text-gray-800 rounded px-2"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={handleChange("email")}
                    value={values.email}
                    onBlur={handleBlur("email")}
                  />
                  {touched.email && errors.email && (
                    <Text className="text-red-500 text-xs mb-2">{errors.email}</Text>
                  )}

                  <Text className="text-[#218fb4] mt-4 mb-2">Password</Text>
                  <View className="flex-row items-center border border-[#218fb4] bg-white rounded h-10">
                    <TextInput
                      className="flex-1 px-2 text-gray-800 h-10"
                      secureTextEntry={!showPassword}
                      onChangeText={handleChange("password")}
                      value={values.password}
                      onBlur={handleBlur("password")}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword((prev) => !prev)}
                      className="px-3"
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#218fb4"
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.password && errors.password && (
                    <Text className="text-red-500 text-xs mb-2">{errors.password}</Text>
                  )}

                  <TouchableOpacity
                    onPress={handleSubmit}
                    className="p-2 mt-6 my-2 bg-[#218fb4] rounded-lg"
                  >
                    <Text className="text-lg text-white font-semibold text-center">
                      Sign In
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/forgot-password")}
                    className="mt-2"
                  >
                    <Text className="text-center text-[#218fb4] text-sm">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>

            <View>
              <TouchableOpacity
                className="my-5 p-2 flex flex-row justify-center items-center"
                onPress={() => router.push("/signup")}
              >
                <Text className="font-semibold">New User?</Text>
                <Text className="text-base font-semibold text-center text-[#218fb4]">  Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <StatusBar barStyle="light-content" backgroundColor="grey" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signin;
