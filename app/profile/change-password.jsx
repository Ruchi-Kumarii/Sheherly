import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../firebase";

export default function ChangePassword() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "Not logged in");
        router.replace("/signin");
        return;
      }

      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      Alert.alert(
        "Password Updated",
        "Your password has been changed successfully.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err) {
      console.log("CHANGE PASSWORD ERROR:", err.code);
      const messages = {
        "auth/wrong-password": "Current password is incorrect.",
        "auth/invalid-credential": "Current password is incorrect.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/weak-password": "New password must be at least 6 characters.",
      };
      Alert.alert("Error", messages[err.code] || "Failed to update password.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f6f7fb] px-6 pt-6">
      <Text className="text-xl font-bold text-gray-800 mb-6">Change Password</Text>

      <TextInput
        placeholder="Current Password"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
        className="bg-white p-3 rounded-2xl shadow mb-4"
      />
      <TextInput
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        className="bg-white p-3 rounded-2xl shadow mb-4"
      />
      <TextInput
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        className="bg-white p-3 rounded-2xl shadow mb-6"
      />

      <TouchableOpacity
        onPress={handleChangePassword}
        className="bg-blue-500 p-4 rounded-2xl items-center"
      >
        <Text className="text-white font-semibold text-base">Update Password</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
