import { useRouter } from "expo-router";
import { Formik } from "formik";
import { Image, ScrollView, StatusBar, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput } from "react-native";
import { useState } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { signupSchema } from "../../utils/authSchema";
import { ADMIN_URL } from "../../config";

const logo = require("../../assets/images/sheherlyTitle.png");

// Generates a strong random password: 10 chars, mix of upper/lower/digits/symbols
const generatePassword = () => {
  const upper  = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower  = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "@#$%&*!";
  const all = upper + lower + digits + symbols;

  // Guarantee at least one of each character type
  const pick = (src) => src[Math.floor(Math.random() * src.length)];
  const base = [pick(upper), pick(lower), pick(digits), pick(symbols)];

  for (let i = base.length; i < 10; i++) {
    base.push(pick(all));
  }

  // Fisher-Yates shuffle so the guaranteed chars aren't always at the front
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }

  return base.join("");
};

const Signup = () => {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (values) => {
    setErrorMsg("");
    setLoading(true);

    const generatedPassword = generatePassword();
    const email = values.email.trim().toLowerCase();

    try {
      // 1. Create Firebase Auth user with the generated password
      const { user } = await createUserWithEmailAndPassword(auth, email, generatedPassword);

      // 2. Save user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: "",
        phone: "",
        role: "user",
        createdAt: new Date().toISOString(),
      });

      // 3. Email the generated password to the user via backend
      const res = await fetch(`${ADMIN_URL}/api/admin/send-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: generatedPassword }),
      });

      if (!res.ok) {
        console.warn("Password email failed to send, but account was created.");
      }

      // 4. Sign out immediately — user must log in manually with the emailed password
      await signOut(auth);

      router.replace("/signin?registered=1");
    } catch (err) {
      console.log("SIGNUP ERROR:", err.code);
      const messages = {
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email": "Please enter a valid email address.",
      };
      setErrorMsg(messages[err.code] || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-white">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="m-2 flex justify-center items-center">
          <Image source={logo} style={{ width: 300, height: 220 }} />

          <View className="w-5/6">
            <Formik
              initialValues={{ email: "" }}
              validationSchema={signupSchema}
              onSubmit={handleSignup}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View className="w-full">
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

                  <Text className="text-gray-400 text-xs mt-3 text-center">
                    A password will be generated and sent to your email.
                  </Text>

                  {errorMsg ? (
                    <Text className="text-red-600 text-center mt-3">{errorMsg}</Text>
                  ) : null}

                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className="p-2 mt-6 my-2 bg-[#218fb4] rounded-lg"
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-lg text-white font-semibold text-center">
                        Sign Up
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </Formik>

            <View>
              <TouchableOpacity
                className="my-5 p-2 flex flex-row justify-center items-center"
                onPress={() => router.push("/signin")}
              >
                <Text className="font-semibold">Already a User?</Text>
                <Text className="text-base font-semibold text-center text-[#218fb4]">  Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <StatusBar barStyle="light-content" backgroundColor="grey" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;
